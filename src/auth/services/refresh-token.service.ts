import { REFRESH_TOKEN_EXPIRES_IN_DAYS } from './../../utils/constants';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { randomUUID } from 'crypto';

import { CryptoService } from './crypto.service';
import {
  RefreshToken,
  RefreshTokenRevokeReason,
} from '../entities/refresh-tokens.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { TokensService } from './tokens.service';
import { User } from 'src/users/users.entity';
import { RefreshTokenContext } from '../interfaces/refresh-token-context';
import { AuthRequestContext } from '../decorators/auth-context.decorator';
import { LessThan, Not, Repository } from 'typeorm';

@Injectable()
export class RefreshTokenService {
  constructor(
    @InjectRepository(RefreshToken)
    private readonly refreshTokenRepo: Repository<RefreshToken>,

    private readonly cryptoService: CryptoService,
    private readonly tokensService: TokensService,
  ) {}

  // -------------------------
  // GENERATE REFRESH TOKEN
  // -------------------------

  async generate(
    userId: number,
    context: RefreshTokenContext = {},
  ): Promise<string> {
    // 1. Generate a cryptographically secure raw token
    const rawToken = this.cryptoService.generateRandomToken();

    // 2. Hash the token before storing it
    const tokenHash = this.cryptoService.hashToken(rawToken);

    // 3. Set token expiration
    const expiresAt = new Date();
    expiresAt.setDate(REFRESH_TOKEN_EXPIRES_IN_DAYS + expiresAt.getDate());

    // 4. Create the refresh token entity
    const refreshToken = this.refreshTokenRepo.create({
      userId,
      tokenHash,
      familyId: context.familyId,
      isRevoked: false,
      revokeReason: null,
      userAgent: context.userAgent,
      ipAddress: context.ipAddress,
      expiresAt,
    });

    // 5. Save the hashed token
    await this.refreshTokenRepo.save(refreshToken);

    // 6. Return the raw token
    return rawToken;
  }

  // -------------------------
  // ISSUE AUTHENTICATION TOKENS
  // -------------------------

  async issueTokens(user: User, context: RefreshTokenContext = {}) {
    // 1. Reuse the existing family or create a new one
    const familyId = context.familyId ?? randomUUID();

    // 2. Generate the access token for this session
    const accessToken = this.tokensService.generateAccessToken(user, familyId);

    // 3. Generate and persist a new refresh token
    const refreshToken = await this.generate(user.id, {
      ...context,
      familyId,
    });

    return {
      accessToken,
      refreshToken,
    };
  }
  // -------------------------
  // REFRESH
  // -------------------------

  async refresh(rawToken: string, context: AuthRequestContext) {
    // 1. Hash the incoming refresh token
    const tokenHash = this.cryptoService.hashToken(rawToken);

    // 2. Find the refresh token and its user
    const refreshToken = await this.refreshTokenRepo.findOne({
      where: {
        tokenHash,
      },
      relations: {
        user: true,
      },
    });

    // 3. Reject unknown tokens
    if (!refreshToken) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    // 4. Detect reuse of a previously revoked refresh token
    if (refreshToken.isRevoked) {
      await this.revokeFamily(refreshToken.familyId);

      throw new UnauthorizedException('Refresh token reuse detected');
    }

    // 5. Reject expired tokens
    if (refreshToken.expiresAt <= new Date()) {
      throw new UnauthorizedException('Refresh token has expired');
    }

    // 6. Revoke the old refresh token
    refreshToken.isRevoked = true;
    refreshToken.revokeReason = RefreshTokenRevokeReason.ROTATED;
    await this.refreshTokenRepo.save(refreshToken);

    // 7. Issue a new access token and refresh token
    return this.issueTokens(refreshToken.user, {
      familyId: refreshToken.familyId,
      userAgent: context.userAgent,
      ipAddress: context.ipAddress,
    });
  }

  // -------------------------
  // REVOKE FAMILY
  // -------------------------

  async revokeFamily(familyId: string): Promise<void> {
    // Revoke all active refresh tokens in the compromised family
    await this.refreshTokenRepo.update(
      {
        familyId,
        isRevoked: false,
      },
      {
        isRevoked: true,
        revokeReason: RefreshTokenRevokeReason.REUSE,
      },
    );
  }

  // -------------------------
  // REVOKE
  // -------------------------

  async revoke(rawToken: string): Promise<{ message: string }> {
    // 1. Hash the incoming refresh token
    const tokenHash = this.cryptoService.hashToken(rawToken);

    // 2. Find the refresh token
    const refreshToken = await this.refreshTokenRepo.findOne({
      where: {
        tokenHash,
      },
    });

    // 3. Revoke the token if it exists
    if (refreshToken && !refreshToken.isRevoked) {
      refreshToken.isRevoked = true;
      refreshToken.revokeReason = RefreshTokenRevokeReason.LOGOUT;
      await this.refreshTokenRepo.save(refreshToken);
    }

    // 4. Return a successful logout response
    return {
      message: 'Logged out successfully',
    };
  }

  // -------------------------
  // REVOKE OTHER
  // -------------------------

  async revokeOtherSessions(
    userId: number,
    currentFamilyId: string,
  ): Promise<void> {
    // Revoke all active refresh tokens except the current session
    await this.refreshTokenRepo.update(
      {
        userId,
        isRevoked: false,
        familyId: Not(currentFamilyId),
      },
      {
        isRevoked: true,
        revokeReason: RefreshTokenRevokeReason.PASSWORD_CHANGED,
      },
    );
  }

  // -------------------------
  // REVOKE ALL SESSIONS
  // -------------------------

  async revokeAllSessions(userId: number): Promise<void> {
    // Revoke all active refresh tokens belonging to the user
    await this.refreshTokenRepo.update(
      {
        userId,
        isRevoked: false,
      },
      {
        isRevoked: true,
        revokeReason: RefreshTokenRevokeReason.PASSWORD_RESET,
      },
    );
  }

  // -------------------------
  // DELETE REFRESH TOKENS
  // -------------------------

  async deleteExpiredTokens(): Promise<number> {
    const result = await this.refreshTokenRepo.delete({
      expiresAt: LessThan(new Date()),
    });

    return result.affected ?? 0;
  }
}
