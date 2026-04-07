import { randomUUID } from 'crypto';
import { promises as fs } from 'fs';
import { extname, join } from 'path';
import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary } from 'cloudinary';

@Injectable()
export class UploadService {
  private readonly cloudinaryFolder: string;
  private readonly cloudName?: string;
  private readonly apiKey?: string;
  private readonly apiSecret?: string;
  private readonly uploadsDirectory: string;
  private readonly backendUrl: string;

  constructor(private readonly configService: ConfigService) {
    this.cloudinaryFolder = configService.get<string>('cloudinary.folder', 'dakar-scholarship-hub');
    this.cloudName = configService.get<string>('cloudinary.cloudName');
    this.apiKey = configService.get<string>('cloudinary.apiKey');
    this.apiSecret = configService.get<string>('cloudinary.apiSecret');
    this.uploadsDirectory = join(process.cwd(), 'uploads');

    const configuredBackendUrl = process.env.BACKEND_URL?.trim();
    const port = configService.get<number>('app.port', 4000);
    this.backendUrl = (configuredBackendUrl && configuredBackendUrl.length > 0
      ? configuredBackendUrl
      : `http://localhost:${port}`
    ).replace(/\/$/, '');

    if (this.isCloudinaryConfigured()) {
      cloudinary.config({
        cloud_name: this.cloudName,
        api_key: this.apiKey,
        api_secret: this.apiSecret,
      });
    }
  }

  async uploadFile(file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('Aucun fichier recu');
    }

    if (!this.isCloudinaryConfigured()) {
      return this.storeLocally(file);
    }

    const base64 = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;
    const result = await cloudinary.uploader.upload(base64, {
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

  private async storeLocally(file: Express.Multer.File) {
    await fs.mkdir(this.uploadsDirectory, { recursive: true });

    const fileExtension = extname(file.originalname) || this.extensionFromMimeType(file.mimetype);
    const fileName = `${randomUUID()}${fileExtension}`;
    const filePath = join(this.uploadsDirectory, fileName);

    await fs.writeFile(filePath, file.buffer);

    return {
      url: `${this.backendUrl}/uploads/${fileName}`,
      publicId: null,
      format: fileExtension.replace('.', '') || 'bin',
      bytes: file.size,
      originalName: file.originalname,
      mimeType: file.mimetype,
    };
  }

  private extensionFromMimeType(mimeType: string) {
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

  private isCloudinaryConfigured() {
    return Boolean(this.cloudName && this.apiKey && this.apiSecret);
  }
}
