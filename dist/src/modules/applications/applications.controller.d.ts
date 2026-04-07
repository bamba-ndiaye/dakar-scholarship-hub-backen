import { CurrentUserData } from '../../common/decorators/current-user.decorator';
import { AssignApplicationDto } from './dto/assign-application.dto';
import { CreateApplicationDto } from './dto/create-application.dto';
import { QueryApplicationsDto } from './dto/query-applications.dto';
import { UpdateApplicationDto } from './dto/update-application.dto';
import { UpdateApplicationStatusDto } from './dto/update-application-status.dto';
import { ApplicationsService } from './applications.service';
export declare class ApplicationsController {
    private readonly applicationsService;
    constructor(applicationsService: ApplicationsService);
    create(user: CurrentUserData, dto: CreateApplicationDto): Promise<{
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
        amount: import("@prisma/client/runtime/library").Decimal;
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
    findMine(user: CurrentUserData, query: QueryApplicationsDto): Promise<import("../../common/pagination/paginated-response").PaginatedResponse<unknown>>;
    findAll(user: CurrentUserData, query: QueryApplicationsDto): Promise<import("../../common/pagination/paginated-response").PaginatedResponse<unknown>>;
    findOne(user: CurrentUserData, id: string): Promise<{
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
        amount: import("@prisma/client/runtime/library").Decimal;
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
    update(user: CurrentUserData, id: string, dto: UpdateApplicationDto): Promise<{
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
        amount: import("@prisma/client/runtime/library").Decimal;
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
    submit(user: CurrentUserData, id: string): Promise<{
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
        amount: import("@prisma/client/runtime/library").Decimal;
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
    updateStatus(user: CurrentUserData, id: string, dto: UpdateApplicationStatusDto): Promise<{
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
        amount: import("@prisma/client/runtime/library").Decimal;
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
    assign(id: string, dto: AssignApplicationDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        amount: import("@prisma/client/runtime/library").Decimal;
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
}
