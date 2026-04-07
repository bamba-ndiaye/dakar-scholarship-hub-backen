"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApplicationsService = void 0;
const crypto_1 = require("crypto");
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../../prisma/prisma.service");
const notifications_service_1 = require("../notifications/notifications.service");
let ApplicationsService = class ApplicationsService {
    constructor(prisma, notificationsService) {
        this.prisma = prisma;
        this.notificationsService = notificationsService;
    }
    async create(userId, dto) {
        const applicationId = (0, crypto_1.randomUUID)();
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
    async update(userId, applicationId, dto) {
        const application = await this.ensureApplicationOwner(applicationId, userId);
        if (application.status !== client_1.ApplicationStatus.DRAFT) {
            throw new common_1.ForbiddenException('Only draft applications can be edited');
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
    async submit(userId, applicationId) {
        const application = await this.ensureApplicationOwner(applicationId, userId);
        if (application.status !== client_1.ApplicationStatus.DRAFT) {
            throw new common_1.ForbiddenException('This application has already been submitted');
        }
        const updatedApplication = await this.prisma.application.update({
            where: { id: applicationId },
            data: {
                status: client_1.ApplicationStatus.SUBMITTED,
                submittedAt: new Date(),
            },
            include: { documents: true },
        });
        return updatedApplication;
    }
    async findMine(userId, query) {
        return this.findMany({ ...query, userId }, userId, client_1.Role.STUDENT);
    }
    async findMany(query, requesterId, requesterRole) {
        const page = query.page ?? 1;
        const limit = query.limit ?? 10;
        const where = {
            status: query.status,
            userId: requesterRole === client_1.Role.STUDENT ? requesterId : query.userId,
            assignedToId: query.assignedToId,
            createdAt: query.dateFrom || query.dateTo
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
    async findOne(applicationId, requesterId, requesterRole) {
        const application = await this.prisma.application.findUnique({
            where: { id: applicationId },
            include: {
                documents: true,
                user: { select: { id: true, firstName: true, lastName: true, email: true, role: true } },
                assignedTo: { select: { id: true, firstName: true, lastName: true, email: true, role: true } },
            },
        });
        if (!application) {
            throw new common_1.NotFoundException('Application not found');
        }
        const canAccess = requesterRole !== client_1.Role.STUDENT ||
            application.userId === requesterId ||
            application.assignedToId === requesterId;
        if (!canAccess) {
            throw new common_1.ForbiddenException('You do not have access to this application');
        }
        return application;
    }
    async updateStatus(applicationId, dto, actorId) {
        const application = await this.prisma.application.findUnique({ where: { id: applicationId } });
        if (!application) {
            throw new common_1.NotFoundException('Application not found');
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
            type: client_1.NotificationType.STATUS_UPDATE,
        });
        return updated;
    }
    async assign(applicationId, dto) {
        const application = await this.prisma.application.findUnique({ where: { id: applicationId } });
        if (!application) {
            throw new common_1.NotFoundException('Application not found');
        }
        const updated = await this.prisma.application.update({
            where: { id: applicationId },
            data: { assignedToId: dto.assignedToId },
        });
        await this.notificationsService.createNotification({
            userId: dto.assignedToId,
            title: 'Nouvelle demande assignee',
            message: 'Une demande de bourse vous a ete assignee pour analyse.',
            type: client_1.NotificationType.ASSIGNMENT,
        });
        return updated;
    }
    async ensureApplicationOwner(applicationId, userId) {
        const application = await this.prisma.application.findUnique({ where: { id: applicationId } });
        if (!application) {
            throw new common_1.NotFoundException('Application not found');
        }
        if (application.userId !== userId) {
            throw new common_1.ForbiddenException('You do not own this application');
        }
        return application;
    }
    buildReference(applicationId, createdAt) {
        const year = createdAt.getFullYear();
        const shortId = applicationId.replace(/-/g, '').slice(0, 6).toUpperCase();
        return `DSH-${year}-${shortId}`;
    }
};
exports.ApplicationsService = ApplicationsService;
exports.ApplicationsService = ApplicationsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        notifications_service_1.NotificationsService])
], ApplicationsService);
//# sourceMappingURL=applications.service.js.map