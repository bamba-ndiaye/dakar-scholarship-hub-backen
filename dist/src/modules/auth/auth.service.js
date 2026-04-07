"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const jwt_1 = require("@nestjs/jwt");
const client_1 = require("@prisma/client");
const bcrypt = __importStar(require("bcrypt"));
const prisma_service_1 = require("../../prisma/prisma.service");
let AuthService = class AuthService {
    constructor(prisma, jwtService, configService) {
        this.prisma = prisma;
        this.jwtService = jwtService;
        this.configService = configService;
    }
    async register(dto) {
        const existingUser = await this.prisma.user.findUnique({ where: { email: dto.email.toLowerCase().trim() } });
        if (existingUser) {
            throw new common_1.ConflictException('Un compte existe deja avec cet email. Veuillez vous connecter.');
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
                role: client_1.Role.STUDENT,
            },
        });
        const tokens = await this.issueTokens(user);
        return { user: this.sanitizeUser(user), ...tokens };
    }
    async login(dto) {
        const user = await this.prisma.user.findUnique({ where: { email: dto.email.toLowerCase().trim() } });
        if (!user) {
            throw new common_1.UnauthorizedException("Email ou mot de passe incorrect. Veuillez vous inscrire si vous n'avez pas de compte.");
        }
        const passwordMatches = await bcrypt.compare(dto.password, user.password);
        if (!passwordMatches) {
            throw new common_1.UnauthorizedException("Email ou mot de passe incorrect. Veuillez vous inscrire si vous n'avez pas de compte.");
        }
        const tokens = await this.issueTokens(user);
        return { user: this.sanitizeUser(user), ...tokens };
    }
    async refresh(dto) {
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
            throw new common_1.UnauthorizedException('Refresh token is invalid or expired');
        }
        const user = await this.prisma.user.findUnique({ where: { id: payload.sub } });
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        await this.prisma.refreshToken.delete({ where: { id: matchingToken.id } });
        const newTokens = await this.issueTokens(user);
        return { user: this.sanitizeUser(user), ...newTokens };
    }
    async logout(userId, dto) {
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
    async me(userId) {
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        return this.sanitizeUser(user);
    }
    async issueTokens(user) {
        const payload = { sub: user.id, email: user.email, role: user.role };
        const accessToken = await this.jwtService.signAsync(payload, {
            secret: this.configService.get('jwt.accessSecret'),
            expiresIn: this.configService.get('jwt.accessExpiresIn', '15m'),
        });
        const refreshToken = await this.jwtService.signAsync(payload, {
            secret: this.configService.get('jwt.refreshSecret'),
            expiresIn: this.configService.get('jwt.refreshExpiresIn', '15d'),
        });
        await this.storeRefreshToken(user.id, refreshToken);
        return { accessToken, refreshToken };
    }
    async storeRefreshToken(userId, refreshToken) {
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
    calculateRefreshExpiration() {
        const expiresIn = this.configService.get('jwt.refreshExpiresIn', '15d');
        const amount = Number(expiresIn.slice(0, -1));
        const unit = expiresIn.slice(-1);
        const now = new Date();
        if (unit === 'd') {
            now.setDate(now.getDate() + amount);
        }
        else if (unit === 'h') {
            now.setHours(now.getHours() + amount);
        }
        else {
            now.setDate(now.getDate() + 15);
        }
        return now;
    }
    async verifyRefreshToken(refreshToken) {
        try {
            return await this.jwtService.verifyAsync(refreshToken, {
                secret: this.configService.get('jwt.refreshSecret'),
            });
        }
        catch {
            throw new common_1.UnauthorizedException('Refresh token is invalid or expired');
        }
    }
    async findMatchingRefreshToken(refreshToken, tokens) {
        for (const token of tokens) {
            const isMatch = await bcrypt.compare(refreshToken, token.token);
            if (isMatch) {
                return token;
            }
        }
        return null;
    }
    sanitizeUser(user) {
        const { password: _password, ...safeUser } = user;
        return safeUser;
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        jwt_1.JwtService,
        config_1.ConfigService])
], AuthService);
//# sourceMappingURL=auth.service.js.map