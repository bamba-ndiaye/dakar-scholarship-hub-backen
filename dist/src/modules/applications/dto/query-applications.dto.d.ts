import { ApplicationStatus } from '@prisma/client';
import { PageOptionsDto } from '../../../common/pagination/page-options.dto';
export declare class QueryApplicationsDto extends PageOptionsDto {
    status?: ApplicationStatus;
    assignedToId?: string;
    userId?: string;
    dateFrom?: string;
    dateTo?: string;
}
