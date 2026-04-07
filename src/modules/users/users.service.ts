import { ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { PaginatedResponse } from '../../common/pagination/paginated-response';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateMunicipalUserDto } from './dto/create-municipal-user.dto';
import { QueryUsersDto } from './dto/query-users.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UpdateUserRoleDto } from './dto/update-user-role.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findProfile(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    return this.stripPassword(user);
  }

  async updateProfile(userId: string, dto: UpdateProfileDto) {
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: dto,
    });

    return this.stripPassword(user);
  }

  async createMunicipal(dto: CreateMunicipalUserDto) {
    const email = dto.email.toLowerCase().trim();
    const existingUser = await this.prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      throw new ConflictException('Un compte existe deja avec cet email.');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);
    const user = await this.prisma.user.create({
      data: {
        firstName: dto.firstName,
        lastName: dto.lastName,
        email,
        password: hashedPassword,
        phone: dto.phone,
        address: dto.address,
        role: Role.MUNICIPAL,
      },
    });

    return this.stripPassword(user);
  }

  async findAll(query: QueryUsersDto): Promise<PaginatedResponse<unknown>> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const where: Prisma.UserWhereInput = {
      role: query.role,
      OR: query.search
        ? [
            { firstName: { contains: query.search, mode: 'insensitive' } },
            { lastName: { contains: query.search, mode: 'insensitive' } },
            { email: { contains: query.search, mode: 'insensitive' } },
          ]
        : undefined,
    };

    const [total, users] = await this.prisma.$transaction([
      this.prisma.user.count({ where }),
      this.prisma.user.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    return {
      data: users.map((user) => this.stripPassword(user)),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async updateRole(userId: string, dto: UpdateUserRoleDto) {
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: { role: dto.role as Role },
    });

    return this.stripPassword(user);
  }

  async updateUser(userId: string, dto: UpdateUserDto) {
    const existingUser = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!existingUser) {
      throw new NotFoundException('Utilisateur introuvable.');
    }

    if (dto.email && dto.email !== existingUser.email) {
      const emailOwner = await this.prisma.user.findUnique({ where: { email: dto.email } });
      if (emailOwner && emailOwner.id !== userId) {
        throw new ConflictException('Un compte existe deja avec cet email.');
      }
    }

    const user = await this.prisma.user.update({
      where: { id: userId },
      data: {
        firstName: dto.firstName,
        lastName: dto.lastName,
        email: dto.email,
        phone: dto.phone,
        address: dto.address,
      },
    });

    return this.stripPassword(user);
  }

  async removeUser(currentUserId: string, userId: string) {
    if (currentUserId === userId) {
      throw new ForbiddenException('Vous ne pouvez pas supprimer votre propre compte.');
    }

    const existingUser = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!existingUser) {
      throw new NotFoundException('Utilisateur introuvable.');
    }

    const deletedUser = await this.prisma.user.delete({ where: { id: userId } });
    return this.stripPassword(deletedUser);
  }

  private stripPassword<T extends { password: string }>(user: T) {
    const { password: _password, ...safeUser } = user;
    return safeUser;
  }
}
