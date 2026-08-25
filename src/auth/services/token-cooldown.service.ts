import { Injectable, BadRequestException } from '@nestjs/common';
import { AuthToken } from '../entities/auth-tokens.entity';

@Injectable()
export class TokenCooldownService {
  // Default cooldown levels in minutes: 15m, 30m, 1h, 24h
  private readonly defaultCooldowns = [15, 30, 60, 1440];

  /**
   * Validates whether the user must wait before requesting a new token.
   * Throws BadRequestException if requests are made too frequently.
   * Returns the next resend count to be assigned.
   */
  validateAndGetNextResendCount(
    existingToken: AuthToken | null,
    customCooldowns?: number[],
  ): number {
    if (!existingToken) {
      return 0; // First attempt, no cooldown required
    }

    const cooldowns = customCooldowns || this.defaultCooldowns;

    // Calculate elapsed time since token creation
    const currentTime = Date.now();
    const tokenCreationTime = new Date(existingToken.createdAt).getTime();
    const diffInMinutes = (currentTime - tokenCreationTime) / (1000 * 60);

    // Determine current cooldown threshold based on resend count
    const currentAttemptIndex = Math.min(
      existingToken.resendCount,
      cooldowns.length - 1,
    );

    const requiredCooldown = cooldowns[currentAttemptIndex];

    // Check if cooldown period is still active
    if (diffInMinutes < requiredCooldown) {
      const remainingMinutes = Math.ceil(requiredCooldown - diffInMinutes);

      throw new BadRequestException({
        code: 'TOKEN_COOLDOWN_ACTIVE',
        message: `Please wait ${remainingMinutes} minute(s) before requesting a new code.`,
        remainingMinutes,
      });
    }

    return existingToken.resendCount + 1;
  }
}
