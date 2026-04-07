import { NotificationType } from '@prisma/client';
import { PaginatedResponse } from '../../common/pagination/paginated-response';
import { PrismaService } from '../../prisma/prisma.service';
import { QueryNotificationsDto } from './dto/query-notifications.dto';
export declare class NotificationsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    createNotification(data: {
        userId: string;
        title: string;
        message: string;
        type: NotificationType;
    }): Promise<{
        message: string;
        type: import(".prisma/client").$Enums.NotificationType;
        title: string;
        id: string;
        createdAt: Date;
        userId: string;
        read: boolean;
    }>;
    findAll(userId: string, query: QueryNotificationsDto): Promise<PaginatedResponse<unknown>>;
    markAsRead(userId: string, notificationId: string): Promise<{
        message: string;
        type: import(".prisma/client").$Enums.NotificationType;
        title: string;
        id: string;
        createdAt: Date;
        userId: string;
        read: boolean;
    }>;
    markAllAsRead(userId: string): Promise<{
        success: boolean;
    }>;
}
