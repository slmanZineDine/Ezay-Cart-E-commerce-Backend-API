import { Inject, Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';

import { type IStorageProvider } from './storage-provider.interface';
import { STORAGE_PROVIDER_TOKEN } from './storage-provider.binding';
import { InjectRepository } from '@nestjs/typeorm';
import { PendingUpload } from '../pending-upload.entity';
import { Repository } from 'typeorm';

@Injectable()
export class UploadsService {
  constructor(
    @Inject(STORAGE_PROVIDER_TOKEN)
    private readonly storageProvider: IStorageProvider,

    @InjectRepository(PendingUpload)
    private readonly pendingUploadsRepo: Repository<PendingUpload>,
  ) {}

  /**
   * Generate a signed upload configuration for a user avatar.
   */
  async createAvatarUpload(userId: number) {
    const imageId = randomUUID();

    const storageKey = `products/${userId}/${imageId}`;

    const response =
      await this.storageProvider.generateUploadSignature(storageKey);

    await this.registerPendingUpload(response.publicId);

    return response;
  }

  /**
   * Generate a signed upload configuration for a single product image.
   */
  async createProductImageUpload(userId: number) {
    const imageId = randomUUID();

    const storageKey = `products/${userId}/${imageId}`;

    // 1. Generate cloud credentials
    const response =
      await this.storageProvider.generateUploadSignature(storageKey);

    // 2. Track the intended upload in our database log
    await this.registerPendingUpload(response.publicId);

    return response;
  }

  /**
   * Generate multiple upload signatures for a product gallery.
   */
  async createProductGalleryUploads(userId: number, count: number) {
    const signatures = Array.from({ length: count }, () => {
      const imageId = randomUUID();

      const storageKey = `products/${userId}/${imageId}`;

      return this.storageProvider.generateUploadSignature(storageKey);
    });

    const responses = await Promise.all(signatures);

    const pendingEntities = responses.map((response) =>
      this.pendingUploadsRepo.create({ storageKey: response.publicId }),
    );

    if (pendingEntities.length > 0) {
      await this.pendingUploadsRepo.save(pendingEntities);
    }

    return responses;
  }

  /**
   * Register a new storage key in the pending database log.
   * This protects against orphaned files if the frontend fails to complete the flow.
   */
  private async registerPendingUpload(storageKey: string): Promise<void> {
    const pending = this.pendingUploadsRepo.create({ storageKey });
    await this.pendingUploadsRepo.save(pending);
  }

  /**
   * Confirm the upload and remove its tracking row from the pending table.
   * Expose this method to be called from UsersService or ProductsService upon successful record creation.
   */
  async confirmUpload(storageKey: string): Promise<void> {
    await this.pendingUploadsRepo.delete(storageKey);
  }

  /**
   * Delete a file from the storage provider.
   */
  async deleteFile(storageKey: string) {
    return this.storageProvider.deleteFile(storageKey);
  }
}
