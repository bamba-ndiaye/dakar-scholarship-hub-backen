import { randomUUID } from 'crypto';
import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { ApplicationStatus, NotificationType, Prisma, Role } from '@prisma/client';
import { PaginatedResponse } from '../../common/pagination/paginated-response';
import { PrismaService } from '../../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { AssignApplicationDto } from './dto/assign-application.dto';
import { CreateApplicationDto } from './dto/create-application.dto';
import { QueryApplicationsDto } from './dto/query-applications.dto';
import { UpdateApplicationDto } from './dto/update-application.dto';
import { UpdateApplicationStatusDto } from './dto/update-application-status.dto';

@Injectable()
export class ApplicationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationsService: NotificationsService,
  ) {}

  async create(userId: string, dto: CreateApplicationDto) {
    const applicationId = randomUUID();
    const createdAt = new Date();

    return this.prisma.application.create({
      data: {
        id: applicationId,
        reference: this.buildReference(applicationId, createdAt),
        userId,
        university: dto.university,
        program: dto.program,
        level: dto.level,
        year: dto.year,
        amount: dto.amount,
        motivation: dto.motivation,
        createdAt,
        documents: dto.documents?.length
          ? {
              create: dto.documents.map((document) => ({
                name: document.name,
                type: document.type,
                fileType: document.fileType,
                size: document.size,
                url: document.url,
              })),
            }
          : undefined,
      },
      include: { documents: true },
    });
  }

  async update(userId: string, applicationId: string, dto: UpdateApplicationDto) {
    const application = await this.ensureApplicationOwner(applicationId, userId);
    if (application.status !== ApplicationStatus.DRAFT) {
      throw new ForbiddenException('Only draft applications can be edited');
    }

    return this.prisma.application.update({
      where: { id: applicationId },
      data: {
        university: dto.university,
        program: dto.program,
        level: dto.level,
        year: dto.year,
        amount: dto.amount,
        motivation: dto.motivation,
      },
      include: { documents: true },
    });
  }

  async submit(userId: string, applicationId: string) {
    const application = await this.ensureApplicationOwner(applicationId, userId);
    if (application.status !== ApplicationStatus.DRAFT) {
      throw new ForbiddenException('This application has already been submitted');
    }

    const updatedApplication = await this.prisma.application.update({
      where: { id: applicationId },
      data: {
        status: ApplicationStatus.SUBMITTED,
        submittedAt: new Date(),
      },
      include: { documents: true },
    });

    return updatedApplication;
  }

  async findMine(userId: string, query: QueryApplicationsDto): Promise<PaginatedResponse<unknown>> {
    return this.findMany({ ...query, userId }, userId, Role.STUDENT);
  }

  async findMany(
    query: QueryApplicationsDto,
    requesterId: string,
    requesterRole: Role,
  ): Promise<PaginatedResponse<unknown>> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const where: Prisma.ApplicationWhereInput = {
      status: query.status,
      userId: requesterRole === Role.STUDENT ? requesterId : query.userId,
      assignedToId: query.assignedToId,
      createdAt:
        query.dateFrom || query.dateTo
          ? {
              gte: query.dateFrom ? new Date(query.dateFrom) : undefined,
              lte: query.dateTo ? new Date(query.dateTo) : undefined,
            }
          : undefined,
    };

    const [total, applications] = await this.prisma.$transaction([
      this.prisma.application.count({ where }),
      this.prisma.application.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          documents: true,
          user: { select: { id: true, firstName: true, lastName: true, email: true, role: true } },
          assignedTo: { select: { id: true, firstName: true, lastName: true, email: true, role: true } },
        },
      }),
    ]);

    return {
      data: applications,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(applicationId: string, requesterId: string, requesterRole: Role) {
    const application = await this.prisma.application.findUnique({
      where: { id: applicationId },
      include: {
        documents: true,
        user: { select: { id: true, firstName: true, lastName: true, email: true, role: true } },
        assignedTo: { select: { id: true, firstName: true, lastName: true, email: true, role: true } },
      },
    });

    if (!application) {
      throw new NotFoundException('Application not found');
    }

    const canAccess =
      requesterRole !== Role.STUDENT ||
      application.userId === requesterId ||
      application.assignedToId === requesterId;

    if (!canAccess) {
      throw new ForbiddenException('You do not have access to this application');
    }

    return application;
  }

  async updateStatus(applicationId: string, dto: UpdateApplicationStatusDto, actorId: string) {
    const application = await this.prisma.application.findUnique({ where: { id: applicationId } });
    if (!application) {
      throw new NotFoundException('Application not found');
    }

    const updated = await this.prisma.application.update({
      where: { id: applicationId },
      data: {
        status: dto.status,
        reviewNote: dto.reviewNote,
        assignedToId: application.assignedToId ?? actorId,
      },
      include: { user: true, documents: true },
    });

    await this.notificationsService.createNotification({
      userId: updated.userId,
      title: 'Mise a jour de votre demande',
      message: `Le statut de votre demande est maintenant ${dto.status}.`,
      type: NotificationType.STATUS_UPDATE,
    });

    return updated;
  }

  async assign(applicationId: string, dto: AssignApplicationDto) {
    const application = await this.prisma.application.findUnique({ where: { id: applicationId } });
    if (!application) {
      throw new NotFoundException('Application not found');
    }

    const updated = await this.prisma.application.update({
      where: { id: applicationId },
      data: { assignedToId: dto.assignedToId },
    });

    await this.notificationsService.createNotification({
      userId: dto.assignedToId,
      title: 'Nouvelle demande assignee',
      message: 'Une demande de bourse vous a ete assignee pour analyse.',
      type: NotificationType.ASSIGNMENT,
    });

    return updated;
  }

  private async ensureApplicationOwner(applicationId: string, userId: string) {
    const application = await this.prisma.application.findUnique({ where: { id: applicationId } });
    if (!application) {
      throw new NotFoundException('Application not found');
    }

    if (application.userId !== userId) {
      throw new ForbiddenException('You do not own this application');
    }

    return application;
  }

  private buildReference(applicationId: string, createdAt: Date) {
    const year = createdAt.getFullYear();
    const shortId = applicationId.replace(/-/g, '').slice(0, 6).toUpperCase();
    return `DSH-${year}-${shortId}`;
  }
}
