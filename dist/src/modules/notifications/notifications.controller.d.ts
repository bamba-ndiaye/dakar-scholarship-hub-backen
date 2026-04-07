import { CurrentUserData } from '../../common/decorators/current-user.decorator';
import { QueryNotificationsDto } from './dto/query-notifications.dto';
import { NotificationsService } from './notifications.service';
export declare class NotificationsController {
    private readonly notificationsService;
    constructor(notificationsService: NotificationsService);
    findAll(user: CurrentUserData, query: QueryNotificationsDto): Promise<import("../../common/pagination/paginated-response").PaginatedResponse<unknown>>;
    markAsRead(user: CurrentUserData, id: string): Promise<{
        message: string;
        type: import(".prisma/client").$Enums.NotificationType;
        title: string;
        id: string;
        createdAt: Date;
        userId: string;
        read: boolean;
    }>;
    markAllAsRead(user: CurrentUserData): Promise<{
        success: boolean;
    }>;
}
