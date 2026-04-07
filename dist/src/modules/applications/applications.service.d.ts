import { Prisma, Role } from '@prisma/client';
import { PaginatedResponse } from '../../common/pagination/paginated-response';
import { PrismaService } from '../../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { AssignApplicationDto } from './dto/assign-application.dto';
import { CreateApplicationDto } from './dto/create-application.dto';
import { QueryApplicationsDto } from './dto/query-applications.dto';
import { UpdateApplicationDto } from './dto/update-application.dto';
import { UpdateApplicationStatusDto } from './dto/update-application-status.dto';
export declare class ApplicationsService {
    private readonly prisma;
    private readonly notificationsService;
    constructor(prisma: PrismaService, notificationsService: NotificationsService);
    create(userId: string, dto: CreateApplicationDto): Promise<{
        documents: {
            type: import(".prisma/client").$Enums.DocumentType;
            id: string;
            name: string;
            fileType: string;
            size: number;
            url: string;
            uploadedAt: Date;
            applicationId: string;
        }[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        amount: Prisma.Decimal;
        university: string;
        program: string;
        level: string;
        year: string;
        motivation: string;
        status: import(".prisma/client").$Enums.ApplicationStatus;
        assignedToId: string | null;
        reviewNote: string | null;
        reference: string;
        submittedAt: Date | null;
    }>;
    update(userId: string, applicationId: string, dto: UpdateApplicationDto): Promise<{
        documents: {
            type: import(".prisma/client").$Enums.DocumentType;
            id: string;
            name: string;
            fileType: string;
            size: number;
            url: string;
            uploadedAt: Date;
            applicationId: string;
        }[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        amount: Prisma.Decimal;
        university: string;
        program: string;
        level: string;
        year: string;
        motivation: string;
        status: import(".prisma/client").$Enums.ApplicationStatus;
        assignedToId: string | null;
        reviewNote: string | null;
        reference: string;
        submittedAt: Date | null;
    }>;
    submit(userId: string, applicationId: string): Promise<{
        documents: {
            type: import(".prisma/client").$Enums.DocumentType;
            id: string;
            name: string;
            fileType: string;
            size: number;
            url: string;
            uploadedAt: Date;
            applicationId: string;
        }[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        amount: Prisma.Decimal;
        university: string;
        program: string;
        level: string;
        year: string;
        motivation: string;
        status: import(".prisma/client").$Enums.ApplicationStatus;
        assignedToId: string | null;
        reviewNote: string | null;
        reference: string;
        submittedAt: Date | null;
    }>;
    findMine(userId: string, query: QueryApplicationsDto): Promise<PaginatedResponse<unknown>>;
    findMany(query: QueryApplicationsDto, requesterId: string, requesterRole: Role): Promise<PaginatedResponse<unknown>>;
    findOne(applicationId: string, requesterId: string, requesterRole: Role): Promise<{
        user: {
            firstName: string;
            lastName: string;
            email: string;
            role: import(".prisma/client").$Enums.Role;
            id: string;
        };
        documents: {
            type: import(".prisma/client").$Enums.DocumentType;
            id: string;
            name: string;
            fileType: string;
            size: number;
            url: string;
            uploadedAt: Date;
            applicationId: string;
        }[];
        assignedTo: {
            firstName: string;
            lastName: string;
            email: string;
            role: import(".prisma/client").$Enums.Role;
            id: string;
        } | null;
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        amount: Prisma.Decimal;
        university: string;
        program: string;
        level: string;
        year: string;
        motivation: string;
        status: import(".prisma/client").$Enums.ApplicationStatus;
        assignedToId: string | null;
        reviewNote: string | null;
        reference: string;
        submittedAt: Date | null;
    }>;
    updateStatus(applicationId: string, dto: UpdateApplicationStatusDto, actorId: string): Promise<{
        user: {
            firstName: string;
            lastName: string;
            email: string;
            password: string;
            phone: string | null;
            address: string | null;
            role: import(".prisma/client").$Enums.Role;
            id: string;
            avatar: string | null;
            createdAt: Date;
            updatedAt: Date;
        };
        documents: {
            type: import(".prisma/client").$Enums.DocumentType;
            id: string;
            name: string;
            fileType: string;
            size: number;
            url: string;
            uploadedAt: Date;
            applicationId: string;
        }[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        amount: Prisma.Decimal;
        university: string;
        program: string;
        level: string;
        year: string;
        motivation: string;
        status: import(".prisma/client").$Enums.ApplicationStatus;
        assignedToId: string | null;
        reviewNote: string | null;
        reference: string;
        submittedAt: Date | null;
    }>;
    assign(applicationId: string, dto: AssignApplicationDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        amount: Prisma.Decimal;
        university: string;
        program: string;
        level: string;
        year: string;
        motivation: string;
        status: import(".prisma/client").$Enums.ApplicationStatus;
        assignedToId: string | null;
        reviewNote: string | null;
        reference: string;
        submittedAt: Date | null;
    }>;
    private ensureApplicationOwner;
    private buildReference;
}
