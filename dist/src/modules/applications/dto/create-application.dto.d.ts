import { DocumentType } from '@prisma/client';
export declare class CreateApplicationDocumentDto {
    name: string;
    type: DocumentType;
    fileType: string;
    size: number;
    url: string;
}
export declare class CreateApplicationDto {
    university: string;
    program: string;
    level: string;
    year: string;
    amount: number;
    motivation: string;
    documents?: CreateApplicationDocumentDto[];
}
