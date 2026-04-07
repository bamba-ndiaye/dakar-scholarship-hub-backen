import { ConfigService } from '@nestjs/config';
export declare class UploadService {
    private readonly configService;
    private readonly cloudinaryFolder;
    private readonly cloudName?;
    private readonly apiKey?;
    private readonly apiSecret?;
    private readonly uploadsDirectory;
    private readonly backendUrl;
    constructor(configService: ConfigService);
    uploadFile(file: Express.Multer.File): Promise<{
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
    private storeLocally;
    private extensionFromMimeType;
    private isCloudinaryConfigured;
}
