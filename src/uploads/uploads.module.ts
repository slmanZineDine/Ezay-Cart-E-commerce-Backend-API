import { Global, Module } from '@nestjs/common';
import { UploadsController } from './uploads.controller';
import { UploadsService } from './services/uploads.service';
import { CloudinaryService } from './services/cloudinary.service';
import { CloudinaryProvider } from './services/cloudinary.provider';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PendingUpload } from './pending-upload.entity';
import { StorageProviderBinding } from './services/storage-provider.binding';

@Global()
@Module({
  imports: [TypeOrmModule.forFeature([PendingUpload])],
  controllers: [UploadsController],
  providers: [
    UploadsService,
    CloudinaryProvider,
    CloudinaryService,
    StorageProviderBinding,
  ],
})
export class UploadsModule {}
