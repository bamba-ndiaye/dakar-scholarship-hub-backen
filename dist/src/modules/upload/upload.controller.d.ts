import { UploadService } from './upload.service';
export declare class UploadController {
    private readonly uploadService;
    constructor(uploadService: UploadService);
    upload(file: Express.Multer.File): Promise<{
        url: string;
        publicId: null;
        format: string;
        bytes: number;
        originalName: string;
        mimeType: string;
    } | {
        url: string;
        publicId: string;
        format: string;
        bytes: number;
        originalName: string;
        mimeType: string;
    }>;
}
