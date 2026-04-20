import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Role, User } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { AuthTokens, JwtPayload } from './auth.types';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async register(dto: RegisterDto) {
    const existingUser = await this.prisma.user.findUnique({ where: { email: dto.email.toLowerCase().trim() } });
    if (existingUser) {
      throw new ConflictException('Un compte existe deja avec cet email. Veuillez vous connecter.');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);
    const user = await this.prisma.user.create({
      data: {
        firstName: dto.firstName,
        lastName: dto.lastName,
        email: dto.email.toLowerCase().trim(),
        password: hashedPassword,
        phone: dto.phone,
        address: dto.address,
        role: Role.STUDENT,
      },
    });

    const tokens = await this.issueTokens(user);
    return { user: this.sanitizeUser(user), ...tokens };
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({ where: { email: dto.email.toLowerCase().trim() } });
    if (!user) {
      throw new UnauthorizedException(
        "Email ou mot de passe incorrect. Veuillez vous inscrire si vous n'avez pas de compte.",
      );
    }

    const passwordMatches = await bcrypt.compare(dto.password, user.password);
    if (!passwordMatches) {
      throw new UnauthorizedException(
        "Email ou mot de passe incorrect. Veuillez vous inscrire si vous n'avez pas de compte.",
      );
    }

    const tokens = await this.issueTokens(user);
    return { user: this.sanitizeUser(user), ...tokens };
  }

  async refresh(dto: RefreshTokenDto) {
    const payload = await this.verifyRefreshToken(dto.refreshToken);
    const tokens = await this.prisma.refreshToken.findMany({
      where: {
        userId: payload.sub,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: 'desc' },
    });

    const matchingToken = await this.findMatchingRefreshToken(dto.refreshToken, tokens);
    if (!matchingToken) {
      throw new UnauthorizedException('Refresh token is invalid or expired');
    }

    const user = await this.prisma.user.findUnique({ where: { id: payload.sub } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    await this.prisma.refreshToken.delete({ where: { id: matchingToken.id } });
    const newTokens = await this.issueTokens(user);
    return { user: this.sanitizeUser(user), ...newTokens };
  }

  async logout(userId: string, dto?: RefreshTokenDto) {
    if (dto?.refreshToken) {
      const tokens = await this.prisma.refreshToken.findMany({ where: { userId } });
      const matchingToken = await this.findMatchingRefreshToken(dto.refreshToken, tokens);
      if (matchingToken) {
        await this.prisma.refreshToken.delete({ where: { id: matchingToken.id } });
      }
      return { success: true };
    }

    await this.prisma.refreshToken.deleteMany({ where: { userId } });
    return { success: true };
  }

  async me(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    return this.sanitizeUser(user);
  }

  private async issueTokens(user: User): Promise<AuthTokens> {
    const payload: JwtPayload = { sub: user.id, email: user.email, role: user.role };

    const accessToken = await this.jwtService.signAsync(payload, {
      secret: this.configService.get<string>('jwt.accessSecret'),
      expiresIn: this.configService.get<string>('jwt.accessExpiresIn', '15m'),
    });

    const refreshToken = await this.jwtService.signAsync(payload, {
      secret: this.configService.get<string>('jwt.refreshSecret'),
      expiresIn: this.configService.get<string>('jwt.refreshExpiresIn', '15d'),
    });

    await this.storeRefreshToken(user.id, refreshToken);
    return { accessToken, refreshToken };
  }

  private async storeRefreshToken(userId: string, refreshToken: string) {
    const hashedToken = await bcrypt.hash(refreshToken, 10);
    const expiresAt = this.calculateRefreshExpiration();

    await this.prisma.refreshToken.create({
      data: {
        userId,
        token: hashedToken,
        expiresAt,
      },
    });
  }

  private calculateRefreshExpiration() {
    const expiresIn = this.configService.get<string>('jwt.refreshExpiresIn', '15d');
    const amount = Number(expiresIn.slice(0, -1));
    const unit = expiresIn.slice(-1);
    const now = new Date();

    if (unit === 'd') {
      now.setDate(now.getDate() + amount);
    } else if (unit === 'h') {
      now.setHours(now.getHours() + amount);
    } else {
      now.setDate(now.getDate() + 15);
    }

    return now;
  }

  private async verifyRefreshToken(refreshToken: string): Promise<JwtPayload> {
    try {
      return await this.jwtService.verifyAsync<JwtPayload>(refreshToken, {
        secret: this.configService.get<string>('jwt.refreshSecret'),
      });
    } catch {
      throw new UnauthorizedException('Refresh token is invalid or expired');
    }
  }

  private async findMatchingRefreshToken(
    refreshToken: string,
    tokens: Array<{ id: string; token: string; expiresAt: Date }>,
  ) {
    for (const token of tokens) {
      const isMatch = await bcrypt.compare(refreshToken, token.token);
      if (isMatch) {
        return token;
      }
    }

    return null;
  }

  private sanitizeUser(user: User) {
    const { password: _password, ...safeUser } = user;
    return safeUser;
  }
}
