import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';

import { RefreshTokenService } from './refresh-token.service';

@Injectable()
export class RefreshTokenCleanupService {
  private readonly logger = new Logger(RefreshTokenCleanupService.name);

  constructor(private readonly refreshTokenService: RefreshTokenService) {}

  @Cron('0 0 3 * * *')
  async cleanupExpiredTokens(): Promise<void> {
    const deletedCount = await this.refreshTokenService.deleteExpiredTokens();

    this.logger.log(`Deleted ${deletedCount} expired refresh tokens.`);
  }
}
