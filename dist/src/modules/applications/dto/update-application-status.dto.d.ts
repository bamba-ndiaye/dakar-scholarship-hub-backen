import { ApplicationStatus } from '@prisma/client';
export declare class UpdateApplicationStatusDto {
    status: ApplicationStatus;
    reviewNote?: string;
}
