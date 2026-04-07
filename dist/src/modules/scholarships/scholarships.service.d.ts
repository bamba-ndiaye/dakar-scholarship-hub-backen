import { PrismaService } from '../../prisma/prisma.service';
import { CreateScholarshipDto } from './dto/create-scholarship.dto';
import { UpdateScholarshipDto } from './dto/update-scholarship.dto';
export declare class ScholarshipsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    create(dto: CreateScholarshipDto): import(".prisma/client").Prisma.Prisma__ScholarshipClient<{
        description: string;
        title: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        amount: import("@prisma/client/runtime/library").Decimal;
        deadline: Date;
    }, never, import("@prisma/client/runtime/library").DefaultArgs>;
    findAll(): import(".prisma/client").Prisma.PrismaPromise<{
        description: string;
        title: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        amount: import("@prisma/client/runtime/library").Decimal;
        deadline: Date;
    }[]>;
    findOne(id: string): Promise<{
        description: string;
        title: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        amount: import("@prisma/client/runtime/library").Decimal;
        deadline: Date;
    }>;
    update(id: string, dto: UpdateScholarshipDto): Promise<{
        description: string;
        title: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        amount: import("@prisma/client/runtime/library").Decimal;
        deadline: Date;
    }>;
    remove(id: string): Promise<{
        success: boolean;
    }>;
}
