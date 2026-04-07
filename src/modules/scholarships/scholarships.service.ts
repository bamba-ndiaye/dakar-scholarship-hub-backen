import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateScholarshipDto } from './dto/create-scholarship.dto';
import { UpdateScholarshipDto } from './dto/update-scholarship.dto';

@Injectable()
export class ScholarshipsService {
  constructor(private readonly prisma: PrismaService) {}

  create(dto: CreateScholarshipDto) {
    return this.prisma.scholarship.create({
      data: {
        title: dto.title,
        description: dto.description,
        amount: dto.amount,
        deadline: new Date(dto.deadline),
      },
    });
  }

  findAll() {
    return this.prisma.scholarship.findMany({ orderBy: { createdAt: 'desc' } });
  }

  async findOne(id: string) {
    const scholarship = await this.prisma.scholarship.findUnique({ where: { id } });
    if (!scholarship) {
      throw new NotFoundException('Scholarship not found');
    }

    return scholarship;
  }

  async update(id: string, dto: UpdateScholarshipDto) {
    await this.findOne(id);

    return this.prisma.scholarship.update({
      where: { id },
      data: {
        title: dto.title,
        description: dto.description,
        amount: dto.amount,
        deadline: dto.deadline ? new Date(dto.deadline) : undefined,
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.scholarship.delete({ where: { id } });
    return { success: true };
  }
}
