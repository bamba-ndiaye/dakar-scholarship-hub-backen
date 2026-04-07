import { NotificationType } from '@prisma/client';
import { PageOptionsDto } from '../../../common/pagination/page-options.dto';
export declare class QueryNotificationsDto extends PageOptionsDto {
    type?: NotificationType;
    read?: boolean;
}
