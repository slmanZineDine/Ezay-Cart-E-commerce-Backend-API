import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';

import { CryptoService } from './crypto.service';
import { UsersService } from '../../users/users.service';
import { RefreshTokenService } from './refresh-token.service';
import { JwtPayload } from '../interfaces/jwt-payload.interface';
import { ChangePasswordDto } from '../dto/change-password.dto';
import { DataSource, Not } from 'typeorm';
import { User } from 'src/users/users.entity';
import {
  RefreshToken,
  RefreshTokenRevokeReason,
} from '../entities/refresh-tokens.entity';

@Injectable()
export class ChangePasswordService {
  constructor(
    private dataSource: DataSource,
    private readonly cryptoService: CryptoService,
    private readonly usersService: UsersService,
    private readonly refreshTokenService: RefreshTokenService,
  ) {}

  async changePassword(currentUser: JwtPayload, dto: ChangePasswordDto) {
    // 1. Find the authenticated user with the password hash
    const user = await this.usersService.findByIdWithPassword(currentUser.sub);

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    // 2. Verify the current password
    const isCurrentPasswordValid = await this.cryptoService.compare(
      dto.currentPassword,
      user.password,
    );

    if (!isCurrentPasswordValid) {
      throw new UnauthorizedException('Current password is incorrect');
    }

    // 3. Ensure the new password is different
    if (dto.currentPassword === dto.newPassword) {
      throw new BadRequestException(
        'New password must be different from the current password',
      );
    }

    // 4. Hash the new password
    const hashedPassword = await this.cryptoService.hash(dto.newPassword);

    // 5. Start a transaction
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 6. Update the user's password
      await queryRunner.manager.update(User, user.id, {
        password: hashedPassword,
      });

      // 7. Revoke all other active sessions
      await queryRunner.manager.update(
        RefreshToken,
        {
          userId: user.id,
          isRevoked: false,
          familyId: Not(currentUser.familyId),
        },
        {
          isRevoked: true,
          revokeReason: RefreshTokenRevokeReason.PASSWORD_CHANGED,
        },
      );

      // 8. Commit both operations atomically
      await queryRunner.commitTransaction();
    } catch {
      // Roll back both operations if anything fails
      await queryRunner.rollbackTransaction();

      throw new InternalServerErrorException(
        'Failed to change password. Please try again later.',
      );
    } finally {
      // Release the database connection
      await queryRunner.release();
    }

    return {
      message: 'Password changed successfully',
    };
  }
}
