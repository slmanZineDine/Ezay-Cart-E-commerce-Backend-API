import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { RefreshTokenService } from './refresh-token.service';
import { PasswordResetService } from './password-reset.service';

@Injectable()
export class TokenCleanupService {
  private readonly logger = new Logger(TokenCleanupService.name);

  constructor(
    private readonly refreshTokenService: RefreshTokenService,
    private readonly passwordResetService: PasswordResetService,
  ) {}

  // A single Cron job handling all token cleanups
  @Cron(CronExpression.EVERY_DAY_AT_3AM)
  async cleanupAllExpiredTokens(): Promise<void> {
    this.logger.log('Starting global expired tokens cleanup...');

    try {
      // Using Promise.all for parallel execution (Performance optimization)
      const [refreshTokensDeleted, authTokensDeleted] = await Promise.all([
        this.refreshTokenService.deleteExpiredTokens(),
        this.passwordResetService.deleteExpiredTokens(),
      ]);

      this.logger.log(
        `Cleanup complete: ${refreshTokensDeleted} refresh tokens, ${authTokensDeleted} auth tokens deleted.`,
      );
    } catch (error: any) {
      this.logger.error('Global token cleanup failed', error.stack);
    }
  }
}
