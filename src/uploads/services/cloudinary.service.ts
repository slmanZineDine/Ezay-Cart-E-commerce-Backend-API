import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  v2 as cloudinary,
  UploadApiResponse,
  UploadApiErrorResponse,
} from 'cloudinary';
import * as streamifier from 'streamifier';
import { IStorageProvider } from './storage-provider.interface';
import { CloudinaryProvider } from './cloudinary.provider';

// Define a strict interface for the signature response payload
export interface CloudinarySignatureResponse {
  signature: string;
  timestamp: number;
  public_id: string;
  folder: string;
  apiKey: string;
  cloudName: string;
  uploadPreset: string;
}

@Injectable()
export class CloudinaryService implements IStorageProvider {
  private readonly logger = new Logger(CloudinaryProvider.provide);

  constructor(
    @Inject(CloudinaryProvider.provide)
    private readonly cloudinaryInstance: typeof cloudinary,
    private readonly configService: ConfigService,
  ) {}

  // =========================================================================
  // Generate a single secure signature locked to a specific path
  // =========================================================================
  async generateUploadSignature(
    storageKey: string,
  ): Promise<CloudinarySignatureResponse> {
    const timestamp = Math.round(new Date().getTime() / 1000);
    // const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);

    // We strictly define the folder path and public_id prefix here
    const rootFolder = this.configService.getOrThrow('CLOUDINARY_ROOT_FOLDER');
    // const targetFolder = `${rootFolder}/${folder}`;
    // const publicId = `file_${uniqueSuffix}`;
    const public_id = `${rootFolder}/${storageKey}`;
    const folder = public_id.split('/').slice(0, -1).join('/'); // Extract folder from publicId

    // Any parameter included here MUST be sent exactly as-is by the frontend.
    // Cloudinary will re-hash these on their servers to validate authenticity.
    const paramsToSign = {
      folder,
      public_id,
      timestamp: timestamp,
      upload_preset: 'nest_preset',
    };

    // Cryptographically sign the parameters using the API Secret
    const signature = this.cloudinaryInstance.utils.api_sign_request(
      paramsToSign,
      this.configService.getOrThrow('CLOUDINARY_API_SECRET'),
    );

    return {
      signature,
      timestamp,
      public_id,
      folder,
      apiKey: this.configService.getOrThrow('CLOUDINARY_API_KEY'),
      cloudName: this.configService.getOrThrow('CLOUDINARY_CLOUD_NAME'),
      uploadPreset: 'nest_preset',
    };
  }

  // =========================================================================
  // Generate bulk signatures for multiple concurrent file uploads
  // =========================================================================
  async generateBulkUploadSignatures(
    count: number,
    folder: string,
  ): Promise<CloudinarySignatureResponse[]> {
    const signaturePromises = Array.from({ length: count }).map(() =>
      this.generateUploadSignature(folder),
    );

    // Resolve all signatures concurrently
    return await Promise.all(signaturePromises);
  }

  async deleteFile(storageKey: string): Promise<boolean> {
    // Reconstruct the full public_id required by Cloudinary for deletion
    // Cloudinary expects the path WITHOUT the extension (e.g., 'nestApp_uploads/users/file_123')
    const rootFolder =
      this.configService.getOrThrow<string>('CLOUD_ROOT_FOLDER');
    const publicIdWithoutExtension = storageKey.split('.')[0];
    const fullPublicId = `${rootFolder}/${publicIdWithoutExtension}`;

    try {
      const response = await cloudinary.uploader.destroy(fullPublicId);

      // Handle the case where the file never existed on the cloud (Orphaned signature)
      if (response.result === 'not found') {
        this.logger.warn(
          `File not found on Cloudinary during deletion: ${fullPublicId}`,
        );
        return false;
      }

      this.logger.log(`Successfully deleted from Cloudinary: ${fullPublicId}`);
      return true;
    } catch (error) {
      this.logger.error(
        `Failed to delete from Cloudinary: ${(error as any)?.message}`,
      );
      throw error;
    }
  }

  // async uploadFile(
  //   file: Express.Multer.File,
  //   folder: string = 'general_uploads',
  // ): Promise<string> {
  //   return new Promise((resolve, reject) => {
  //     const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);

  //     // 1. Check if the file is an image based on its mime type
  //     const isImage = file.mimetype.startsWith('image/');

  //     // 2. Base configuration for all file types
  //     const uploadOptions: any = {
  //       folder: `nestApp_uploads/${folder}`,
  //       public_id: `file_${uniqueSuffix}`,
  //       // 'auto' automatically detects if it's an image, video, or raw file (like .zip)
  //       resource_type: 'auto',
  //     };

  //     // 3. Apply heavy transformations ONLY if it's an image
  //     if (isImage) {
  //       uploadOptions.transformation = [
  //         { width: 1200, height: 1200, crop: 'limit' }, // Resize if larger than bounds
  //         { quality: 'auto' }, // Smart compression (8MB -> 300KB)
  //         { fetch_format: 'webp' }, // Force format normalization to WebP
  //         { flags: 'strip_profile' }, // Completely strip EXIF Metadata and GPS locations
  //       ];
  //     }

  //     const uploadStream = this.cloudinaryInstance.uploader.upload_stream(
  //       uploadOptions,
  //       (error?: UploadApiErrorResponse, result?: UploadApiResponse) => {
  //         if (error) return reject(error);
  //         if (!result) return reject(new Error('No result from Cloudinary'));

  //         resolve(result.secure_url);
  //       },
  //     );

  //     streamifier.createReadStream(file.buffer).pipe(uploadStream);
  //   });
  // }

  // // This is the new method for handling multiple files
  // async uploadMultipleFiles(
  //   files: Express.Multer.File[],
  //   folder: string,
  // ): Promise<string[]> {
  //   // Map each file to the uploadFile promise without awaiting them individually yet
  //   const uploadPromises = files.map((file) => this.uploadFile(file, folder));

  //   // Execute all uploads concurrently. The overall time will be equal to the slowest file, not the sum of all files.
  //   const uploadedUrls = await Promise.all(uploadPromises);

  //   return uploadedUrls;
  // }
}
