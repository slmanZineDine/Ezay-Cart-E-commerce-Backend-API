import { type IStorageProvider } from './services/storage-provider.interface';
import {
  BadRequestException,
  Body,
  Controller,
  InternalServerErrorException,
  ParseIntPipe,
  Post,
  UploadedFile,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {
  FileFieldsInterceptor,
  FileInterceptor,
  FilesInterceptor,
} from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { UploadsService } from './services/uploads.service';
import { CloudinaryService } from './services/cloudinary.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { createSecureFilePipe } from 'src/common/pipes/file-upload.pipe';
import type { JwtPayload } from 'src/auth/interfaces/jwt-payload.interface';
import { ApiBearerAuth } from '@nestjs/swagger';

@Controller('uploads')
@ApiBearerAuth()
export class UploadsController {
  constructor(private readonly uploadsService: UploadsService) {}

  // =========================================================================
  // Local File Upload
  // =========================================================================
  // @Post('upload-locally')
  // @UseGuards(JwtAuthGuard)
  // @UseInterceptors(
  //   FileInterceptor('file', {
  //     storage: diskStorage({
  //       destination: './uploads',
  //       filename: (req, file, callback) => {
  //         const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1e9);

  //         callback(null, `${uniqueName}${extname(file.originalname)}`);
  //       },
  //     }),
  //   }),
  // )
  // uploadFile(
  //   @UploadedFile(createSecureFilePipe())
  //   file: Express.Multer.File,
  // ) {
  //   return {
  //     message: 'File uploaded successfully',
  //     filename: file.filename,
  //     url: this.uploadsService.getFileUrl(file.filename),
  //   };
  // }

  // =========================================================================
  // Cloudinary Upload
  // =========================================================================
  // @Post('profile-image')
  // @UseGuards(JwtAuthGuard)
  // @UseInterceptors(FileInterceptor('file'))
  // async uploadProfileImage(
  //   @UploadedFile(createSecureFilePipe())
  //   file: Express.Multer.File,
  // ) {
  //   try {
  //     const fileUrl = await this.cloudinaryService.uploadFile(
  //       file,
  //       'users_profiles',
  //     );
  //     return { url: fileUrl };
  //   } catch (error) {
  //     throw new InternalServerErrorException({
  //       message: 'Cloudinary upload failed',
  //       error: (error as any)?.message,
  //     });
  //   }
  // }

  // @Post('product-image')
  // @UseGuards(JwtAuthGuard)
  // @UseInterceptors(FilesInterceptor('gallery', 5))
  // async uploadProductImage(
  //   @UploadedFiles(createSecureFilePipe()) files: Array<Express.Multer.File>,
  //   @CurrentUser() user: JwtPayload,
  // ) {
  //   if (!files || files.length === 0) {
  //     throw new BadRequestException('Gallery are required');
  //   }

  //   try {
  //     const dynamicFolder = `products/user_${user.sub}`;

  //     const galleryUrls = await this.cloudinaryService.uploadMultipleFiles(
  //       files,
  //       dynamicFolder,
  //     );
  //     return { urls: galleryUrls };
  //   } catch (error) {
  //     throw new InternalServerErrorException({
  //       message: 'Cloudinary upload failed',
  //       error: (error as any)?.message,
  //     });
  //   }
  // }

  // =========================================================================
  // Signed-URLs
  // =========================================================================
  @Post('product-signatures')
  @UseGuards(JwtAuthGuard)
  getProductUploadSignatures(
    @CurrentUser() user: JwtPayload,
    @Body('count', ParseIntPipe) count: number = 1,
  ) {
    const userId = user.sub;
    return count > 1
      ? this.uploadsService.createProductGalleryUploads(userId, count)
      : this.uploadsService.createProductImageUpload(userId);
  }
  @Post('profile-signature')
  @UseGuards(JwtAuthGuard)
  getProfileUploadSignature(@CurrentUser() user: JwtPayload) {
    const userId = user.sub;

    return this.uploadsService.createAvatarUpload(userId);
  }
}
