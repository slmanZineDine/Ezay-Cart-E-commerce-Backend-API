import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuthToken, AuthTokenType } from '../entities/auth-tokens.entity';
import { UsersService } from 'src/users/users.service';

import { EmailSenderService } from 'src/common/modules/email/email-sender.service';
import { ResendTokenDto } from '../dto/resend-token.dto';
import { TokenCooldownService } from './token-cooldown.service';
import { CryptoService } from './crypto.service';
import { EMAIL_SENDER } from 'src/common/modules/email/email-sender.interface';

@Injectable()
export class EmailVerificationService {
  constructor(
    @InjectRepository(AuthToken)
    private readonly tokenRepo: Repository<AuthToken>,

    private readonly usersService: UsersService,
    private readonly cryptoService: CryptoService,
    @Inject(EMAIL_SENDER)
    private readonly emailService: EmailSenderService,
    private readonly tokenCooldownService: TokenCooldownService,
  ) {}

  // -------------------------
  // VERIFY EMAIL
  // -------------------------
  async verifyEmail(rawToken: string) {
    // 1. Hash the incoming raw token
    const tokenHash = this.cryptoService.hashToken(rawToken);

    // 2. Find the email verification token
    const verificationToken = await this.tokenRepo.findOne({
      where: {
        tokenHash,
      },
      relations: ['user'],
    });

    if (!verificationToken) {
      throw new BadRequestException('Invalid verification token');
    }

    // 3. Check token expiration
    if (verificationToken.expiresAt < new Date()) {
      throw new BadRequestException('Verification token has expired');
    }

    // 4. Mark the user's email as verified
    const verifiedUser = await this.usersService.markEmailAsVerified(
      verificationToken.user,
    );

    // 5. Delete the token so it cannot be reused
    await this.tokenRepo.remove(verificationToken);

    return {
      message: 'Email verified successfully',
      user: {
        id: verifiedUser.id,
        email: verifiedUser.email,
        username: verifiedUser.username,
        role: verifiedUser.role,
        emailVerified: verifiedUser.emailVerified,
      },
    };
  }

  // -------------------------
  // RESEND VERIFICATION TOKEN
  // -------------------------
  async resendVerificationToken(dto: ResendTokenDto) {
    // 1. Find the user by email
    const user = await this.usersService.findByEmail(dto.email);

    if (!user) {
      return {
        message:
          'If your email is registered, a new verification code has been sent.',
      };
    }

    // 2. Check if the user is already verified
    if (user.emailVerified) {
      throw new BadRequestException('Email is already verified');
    }

    // 3. Find the existing verification token
    const existingToken = await this.tokenRepo.findOne({
      where: {
        userId: user.id,
        type: AuthTokenType.EMAIL_VERIFICATION,
      },
      order: { createdAt: 'DESC' }, // Retrieve the latest token
    });

    // 4. Validate cooldown and get next resend count in 1 clean step
    let nextResendCount =
      this.tokenCooldownService.validateAndGetNextResendCount(existingToken);

    if (existingToken) {
      // Remove the old token before creating a new one
      await this.tokenRepo.remove(existingToken);
    }

    // 5. Generate and save the token
    const rawToken = await this.generateAndSaveToken(user.id, nextResendCount);

    // 6. Send the raw token to the user
    await this.emailService.sendVerificationEmail({
      email: user.email,
      username: user.username,
      token: rawToken,
    });

    return {
      message:
        'If your email is registered, a new verification code has been sent.',
    };
  }

  /**
   * Generates a new verification token, hashes it, saves it to the database,
   * and returns the raw token to be sent to the user.
   */
  async generateAndSaveToken(
    userId: number,
    resendCount: number = 0,
  ): Promise<string> {
    // 1. Generate a new raw token
    const rawToken = this.cryptoService.generateRandomToken();

    // 2. Hash the token before storing it
    const tokenHash = this.cryptoService.hashToken(rawToken);

    // 3. Set token expiration (24 hours)
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);

    // 4. Create and save the token entity
    const verificationToken = this.tokenRepo.create({
      userId,
      type: AuthTokenType.EMAIL_VERIFICATION,
      tokenHash,
      resendCount,
      expiresAt,
    });

    await this.tokenRepo.save(verificationToken);

    // 5. Return the raw token so it can be emailed to the user
    return rawToken;
  }
}
