import { Role } from '@prisma/client';
import { PageOptionsDto } from '../../../common/pagination/page-options.dto';
export declare class QueryUsersDto extends PageOptionsDto {
    role?: Role;
    search?: string;
}
