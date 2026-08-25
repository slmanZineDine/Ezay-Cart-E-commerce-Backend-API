import { FileValidator } from '@nestjs/common';

export class MinFileSizeValidator extends FileValidator<{ minSize: number }> {
  constructor(validationOptions: { minSize: number }) {
    super(validationOptions);
  }

  isValid(file: Express.Multer.File): boolean {
    return file.size >= this.validationOptions.minSize;
  }

  buildErrorMessage(): string {
    return `File is too small. Minimum size required is ${this.validationOptions.minSize} bytes.`;
  }
}
