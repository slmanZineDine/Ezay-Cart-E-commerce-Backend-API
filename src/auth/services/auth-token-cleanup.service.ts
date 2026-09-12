import { Injectable, Logger } from '@nestjs/common';
import { PasswordResetService } from './password-reset.service';
import { Cron } from '@nestjs/schedule';

@Injectable()
export class AuthTokenCleanupService {
  private readonly logger = new Logger(AuthTokenCleanupService.name);

  constructor(private readonly passwordResetService: PasswordResetService) {}

  @Cron('0 0 3 * * *')
  async cleanupExpiredTokens(): Promise<void> {
    const deletedCount = await this.passwordResetService.deleteExpiredTokens();

    this.logger.log(`Deleted ${deletedCount} expired auth tokens.`);
  }
}
