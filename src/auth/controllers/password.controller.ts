import {
  Body,
  Controller,
  HttpCode,
  Post,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import { ResetPasswordDto } from '../dto/reset-password.dto';
import { VerifyResetTokenDto } from '../dto/verify-reset-token.dto';
import { ForgotPasswordDto } from '../dto/forgot-password.dto';
import { PasswordResetService } from '../services/password-reset.service';

import {
  AuthContext,
  type AuthRequestContext,
} from '../decorators/auth-context.decorator';

import { type Response } from 'express';
import { AuthCookieService } from '../services/auth-cookie.service';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { CurrentUser } from '../decorators/current-user.decorator';
import { type JwtPayload } from '../interfaces/jwt-payload.interface';

import { ChangePasswordDto } from '../dto/change-password.dto';
import { ChangePasswordService } from '../services/change-password.service';
import { Throttle } from '@nestjs/throttler';

@ApiTags('Auth')
@Controller('auth')
export class PasswordController {
  constructor(
    private readonly passwordResetService: PasswordResetService,
    private readonly authCookieService: AuthCookieService,
    private readonly changePasswordService: ChangePasswordService,
  ) {}

  // -------------------------
  // REQUEST PASSWORD RESET
  // POST /auth/forgot-password
  // -------------------------

  @Post('forgot-password')
  @Throttle({ default: { limit: 3, ttl: 60000 } }) // Allow 3 requests per 60s to prevent email flooding while leaving room for your service cooldown
  @HttpCode(200)
  @ApiOperation({
    summary: 'Request password reset',
    description:
      'Initiates the password reset process by sending a password reset token to the user email.',
  })
  async forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.passwordResetService.forgotPassword(dto.email);
  }

  // -------------------------
  // VERIFY RESET TOKEN
  // POST /auth/verify-reset-token
  // -------------------------

  @Post('verify-reset-token')
  @Throttle({ default: { limit: 5, ttl: 60000 } }) // Strict limit (5 attempts/min) to block OTP brute-force guessing
  @HttpCode(200)
  @ApiOperation({
    summary: 'Verify password reset token',
    description:
      'Verifies whether the provided password reset token is valid and can be used to reset the password.',
  })
  async verifyResetToken(@Body() dto: VerifyResetTokenDto) {
    return this.passwordResetService.verifyResetOTP(dto);
  }

  // -------------------------
  // RESET PASSWORD
  // POST /auth/reset-password
  // -------------------------

  @Post('reset-password')
  @Throttle({ default: { limit: 5, ttl: 60000 } }) // Strict limit (5 attempts/min) to protect token submission
  @HttpCode(200)
  @ApiOperation({
    summary: 'Reset password',
    description:
      'Resets the user password using a valid password reset token and creates a new authenticated session.',
  })
  async resetPassword(
    @Body() dto: ResetPasswordDto,
    @AuthContext() context: AuthRequestContext,
    @Res({ passthrough: true }) response: Response,
  ) {
    const result = await this.passwordResetService.resetPassword(dto, context);

    this.authCookieService.setRefreshToken(response, result.refreshToken);

    return {
      accessToken: result.accessToken,
      user: result.user,
    };
  }

  // -------------------------
  // CHANGE PASSWORD
  // POST /auth/change-password
  // -------------------------

  @Post('change-password')
  @Throttle({ default: { limit: 5, ttl: 60000 } }) // Prevent brute-force guessing of the current password on an active session
  @ApiBearerAuth()
  @HttpCode(200)
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Change password',
    description:
      'Changes the authenticated user password using the current password and the new password.',
  })
  async changePassword(
    @CurrentUser() user: JwtPayload,
    @Body() dto: ChangePasswordDto,
  ) {
    return this.changePasswordService.changePassword(user, dto);
  }
}
