import {
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
} from '@nestjs/common';
import { MinFileSizeValidator } from '../validators/min-file-size.validator';

// Define an interface for custom validation options
interface UploadValidatorOptions {
  maxSizeInBytes?: number;
  minSizeInBytes?: number;
  allowedMimeTypesRegex?: string;
}

export const createSecureFilePipe = (options: UploadValidatorOptions = {}) => {
  // Set default values if options are not provided
  const maxSize = options.maxSizeInBytes ?? 2 * 1024 * 1024; // Default: 2MB
  const minSize = options.minSizeInBytes ?? 10 * 1024; // Default: 10KB
  // Default regex to securely match standard images via their magic numbers
  const allowedTypes =
    options.allowedMimeTypesRegex ?? 'image/(jpeg|png|jpg|webp)';

  return new ParseFilePipe({
    validators: [
      // 1. Validate maximum file size
      new MaxFileSizeValidator({ maxSize }),

      // 2. Validate minimum file size
      new MinFileSizeValidator({ minSize }),

      // 3. Built-in secure validation using magic numbers under the hood
      new FileTypeValidator({ fileType: allowedTypes }),
    ],
  });
};
