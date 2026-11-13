import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

import { VerifyEmailDto } from '../dto/verify-email.dto';
import { ResendTokenDto } from '../dto/resend-token.dto';
import { EmailVerificationService } from '../services/email-verification.service';
import { Throttle } from '@nestjs/throttler';

@ApiTags('Auth')
@Controller('auth')
export class EmailVerificationController {
  constructor(
    private readonly emailVerificationService: EmailVerificationService,
  ) {}

  // -------------------------
  // RESEND VERIFICATION TOKEN
  // POST /auth/resend-verification
  // -------------------------

  @Post('resend-verification')
  @Throttle({ default: { limit: 2, ttl: 60000 } }) // Allow maximum 2 requests per 60 seconds to prevent email spamming
  @HttpCode(200)
  @ApiOperation({
    summary: 'Resend email verification token',
    description:
      'Generates and sends a new email verification token to the user.',
  })
  async resendVerification(@Body() dto: ResendTokenDto) {
    return this.emailVerificationService.resendVerificationToken(dto);
  }

  // -------------------------
  // VERIFY EMAIL
  // POST /auth/verify-email
  // -------------------------

  @Post('verify-email')
  @Throttle({ default: { limit: 5, ttl: 60000 } }) // Allow maximum 5 attempts per 60 seconds to prevent token guessing
  @HttpCode(200)
  @ApiOperation({
    summary: 'Verify email address',
    description:
      'Verifies the user email address using the provided verification token.',
  })
  async verifyEmail(@Body() dto: VerifyEmailDto) {
    return this.emailVerificationService.verifyEmail(dto.token);
  }
}
