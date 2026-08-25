import { HttpException, HttpStatus } from '@nestjs/common';

export class EmailNotVerifiedException extends HttpException {
  constructor() {
    super(
      {
        message: 'Please verify your email before logging in',
        code: 'EMAIL_NOT_VERIFIED',
      },
      HttpStatus.FORBIDDEN,
    );
  }
}
