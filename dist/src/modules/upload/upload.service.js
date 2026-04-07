"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UploadService = void 0;
const crypto_1 = require("crypto");
const fs_1 = require("fs");
const path_1 = require("path");
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const cloudinary_1 = require("cloudinary");
let UploadService = class UploadService {
    constructor(configService) {
        this.configService = configService;
        this.cloudinaryFolder = configService.get('cloudinary.folder', 'dakar-scholarship-hub');
        this.cloudName = configService.get('cloudinary.cloudName');
        this.apiKey = configService.get('cloudinary.apiKey');
        this.apiSecret = configService.get('cloudinary.apiSecret');
        this.uploadsDirectory = (0, path_1.join)(process.cwd(), 'uploads');
        const configuredBackendUrl = process.env.BACKEND_URL?.trim();
        const port = configService.get('app.port', 4000);
        this.backendUrl = (configuredBackendUrl && configuredBackendUrl.length > 0
            ? configuredBackendUrl
            : `http://localhost:${port}`).replace(/\/$/, '');
        if (this.isCloudinaryConfigured()) {
            cloudinary_1.v2.config({
                cloud_name: this.cloudName,
                api_key: this.apiKey,
                api_secret: this.apiSecret,
            });
        }
    }
    async uploadFile(file) {
        if (!file) {
            throw new common_1.BadRequestException('Aucun fichier recu');
        }
        if (!this.isCloudinaryConfigured()) {
            return this.storeLocally(file);
        }
        const base64 = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;
        const result = await cloudinary_1.v2.uploader.upload(base64, {
            folder: this.cloudinaryFolder,
            resource_type: 'auto',
        });
        return {
            url: result.secure_url,
            publicId: result.public_id,
            format: result.format,
            bytes: result.bytes,
            originalName: file.originalname,
            mimeType: file.mimetype,
        };
    }
    async storeLocally(file) {
        await fs_1.promises.mkdir(this.uploadsDirectory, { recursive: true });
        const fileExtension = (0, path_1.extname)(file.originalname) || this.extensionFromMimeType(file.mimetype);
        const fileName = `${(0, crypto_1.randomUUID)()}${fileExtension}`;
        const filePath = (0, path_1.join)(this.uploadsDirectory, fileName);
        await fs_1.promises.writeFile(filePath, file.buffer);
        return {
            url: `${this.backendUrl}/uploads/${fileName}`,
            publicId: null,
            format: fileExtension.replace('.', '') || 'bin',
            bytes: file.size,
            originalName: file.originalname,
            mimeType: file.mimetype,
        };
    }
    extensionFromMimeType(mimeType) {
        const subtype = mimeType.split('/')[1]?.trim().toLowerCase();
        switch (subtype) {
            case 'jpeg':
            case 'jpg':
                return '.jpg';
            case 'png':
                return '.png';
            case 'pdf':
                return '.pdf';
            default:
                return '';
        }
    }
    isCloudinaryConfigured() {
        return Boolean(this.cloudName && this.apiKey && this.apiSecret);
    }
};
exports.UploadService = UploadService;
exports.UploadService = UploadService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], UploadService);
//# sourceMappingURL=upload.service.js.map