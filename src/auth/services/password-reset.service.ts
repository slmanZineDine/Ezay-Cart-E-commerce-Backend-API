import {
  BadRequestException,
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, LessThan, Repository } from 'typeorm';

import { AuthToken, AuthTokenType } from '../entities/auth-tokens.entity';

import { UsersService } from '../../users/users.service';

import { EmailSenderService } from '../../common/modules/email/email-sender.service';
import { CryptoService } from './crypto.service';
import { TokenCooldownService } from './token-cooldown.service';
import { VerifyResetTokenDto } from '../dto/verify-reset-token.dto';
import { ResetPasswordDto } from '../dto/reset-password.dto';
import { User } from '../../users/users.entity';
import { EmailNotVerifiedException } from '../../common/exceptions/email-not-verified.exception';
import { AuthRequestContext } from '../decorators/auth-context.decorator';
import { RefreshTokenService } from './refresh-token.service';
import {
  RefreshToken,
  RefreshTokenRevokeReason,
} from '../entities/refresh-tokens.entity';
import { EMAIL_SENDER } from '../../common/modules/email/email-sender.interface';

@Injectable()
export class PasswordResetService {
  constructor(
    @InjectRepository(AuthToken)
    private readonly tokenRepo: Repository<AuthToken>,

    private dataSource: DataSource,
    private readonly usersService: UsersService,
    private readonly cryptoService: CryptoService,
    @Inject(EMAIL_SENDER)
    private readonly emailService: EmailSenderService,
    private readonly tokenCooldownService: TokenCooldownService,
    private readonly refreshTokenService: RefreshTokenService,
  ) {}

  // -------------------------
  // PASSWORD RESET
  // -------------------------
  async forgotPassword(email: string) {
    // 1. Find the user by email
    const user = await this.usersService.findByEmail(email);

    // Do not reveal whether the email exists
    if (!user) {
      return {
        message:
          'If your email is registered, a password reset code has been sent.',
      };
    }

    if (!user.emailVerified) {
      throw new EmailNotVerifiedException();
    }

    // 2. Generate and send the password reset code
    await this.sendPasswordResetCode(user);

    return {
      message:
        'If your email is registered, a password reset code has been sent.',
    };
  }

  // -------------------------
  // VERIFY RESET TOKEN
  // -------------------------
  async verifyResetOTP(dto: VerifyResetTokenDto) {
    await this.validateResetTokenAndGetUser(dto.email, dto.token);

    return {
      message: 'Password reset code is valid',
    };
  }

  // -------------------------
  // RESET PASSWORD
  // -------------------------
  async resetPassword(dto: ResetPasswordDto, context: AuthRequestContext) {
    // 1. Validate OTP and extract the user object
    const { user } = await this.validateResetTokenAndGetUser(
      dto.email,
      dto.token,
    );

    // 2. Hash the new password
    const hashedNewPassword = await this.cryptoService.hash(dto.newPassword);

    // 3. Execute Password Update & Token Deletion in a Transaction
    // Transactions ensure that if one operation fails, the other is rolled back,
    // preventing a scenario where a password is changed but the token remains active.

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Update the user's password
      await queryRunner.manager.update(User, user.id, {
        password: hashedNewPassword,
      });

      // Delete the used token (and any other older ones) to prevent reuse
      await queryRunner.manager.delete(AuthToken, {
        userId: user.id,
        type: AuthTokenType.PASSWORD_RESET,
      });

      await queryRunner.manager.update(
        RefreshToken,
        {
          userId: user.id,
          isRevoked: false,
        },
        {
          isRevoked: true,
          revokeReason: RefreshTokenRevokeReason.PASSWORD_RESET,
        },
      );

      await queryRunner.commitTransaction();
    } catch {
      await queryRunner.rollbackTransaction();
      throw new InternalServerErrorException(
        'Failed to reset password. Please try again later.',
      );
    } finally {
      await queryRunner.release();
    }

    // 4. Issue a new access token and refresh token
    const { accessToken, refreshToken } =
      await this.refreshTokenService.issueTokens(user, context);

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        role: user.role,
        emailVerified: user.emailVerified,
      },
    };
  }

  // -------------------------
  // FORCE PASSWORD RESET
  // -------------------------

  async forcePasswordReset(userId: number) {
    const user = await this.usersService.findById(userId);

    if (!user.emailVerified) {
      throw new EmailNotVerifiedException();
    }

    await this.sendPasswordResetCode(user);

    return {
      message: 'Password reset code has been sent to the user.',
    };
  }

  // ==================== Private Helpers ====================

  /**
   * Centralized validation logic for verifying OTPs.
   * Throws BadRequestException if validation fails.
   * Returns the user and the token entities if validation succeeds.
   */
  private async validateResetTokenAndGetUser(email: string, rawOtp: string) {
    // 1. Find the user
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      // Generic message to prevent email enumeration attacks
      throw new BadRequestException('Invalid request');
    }

    // 2. Retrieve the latest active password reset token for this user
    const resetToken = await this.tokenRepo.findOne({
      where: {
        userId: user.id,
        type: AuthTokenType.PASSWORD_RESET,
      },
      order: { createdAt: 'DESC' },
    });

    if (!resetToken) {
      throw new BadRequestException('Invalid or expired password reset code');
    }

    // 3. Check expiration
    if (resetToken.expiresAt < new Date()) {
      throw new BadRequestException('Password reset code has expired');
    }

    // 4. Verify the OTP against the stored hash
    const isValid = await this.cryptoService.compare(
      rawOtp,
      resetToken.tokenHash,
    );

    if (!isValid) {
      throw new BadRequestException('Invalid password reset code');
    }

    // 5. Return the entities for downstream usage
    return { user, resetToken };
  }

  private async sendPasswordResetCode(user: User): Promise<void> {
    // 1. Find the existing password reset token
    const existingToken = await this.tokenRepo.findOne({
      where: {
        userId: user.id,
        type: AuthTokenType.PASSWORD_RESET,
      },
    });

    // 2. Validate the cooldown and calculate the next resend count
    const nextResendCount =
      this.tokenCooldownService.validateAndGetNextResendCount(existingToken);

    // 3. Remove the previous token before creating a new one
    if (existingToken) {
      await this.tokenRepo.remove(existingToken);
    }

    // 4. Generate a new 6-digit reset code
    const rawToken = this.cryptoService.generateOTP();

    // 5. Hash the code before storing it
    const tokenHash = await this.cryptoService.hash(rawToken, 6);

    // 6. Set the token expiration time
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 15);

    // 7. Create the password reset token
    const resetToken = this.tokenRepo.create({
      userId: user.id,
      type: AuthTokenType.PASSWORD_RESET,
      resendCount: nextResendCount,
      tokenHash,
      expiresAt,
    });

    // 8. Save the hashed token
    await this.tokenRepo.save(resetToken);

    // 9. Send the raw code to the user's email
    await this.emailService.sendPasswordResetEmail({
      email: user.email,
      username: user.username,
      otp: rawToken,
    });
  }

  // -------------------------
  // DELETE EXPIRED AUTH TOKENS
  // -------------------------
  async deleteExpiredTokens(): Promise<number> {
    const result = await this.tokenRepo.delete({
      expiresAt: LessThan(new Date()),
    });

    return result.affected ?? 0;
  }
}
