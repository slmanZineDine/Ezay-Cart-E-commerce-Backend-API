import { forwardRef, Module } from '@nestjs/common';
import { AuthController } from './controllers/auth.controller';
import { AuthService } from './services/auth.service';
import { UsersModule } from 'src/users/users.module';
import { SecurityModule } from '../common/modules/security/security.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmailModule } from 'src/common/modules/email/email.module';
import { EmailVerificationController } from './controllers/email-verification.controller';
import { PasswordController } from './controllers/password.controller';
import { EmailVerificationService } from './services/email-verification.service';
import { PasswordResetService } from './services/password-reset.service';
import { AuthToken } from './entities/auth-tokens.entity';
import { CryptoService } from './services/crypto.service';
import { TokensService } from './services/tokens.service';
import { TokenCooldownService } from './services/token-cooldown.service';
import { RefreshTokenService } from './services/refresh-token.service';
import { AuthCookieService } from './services/auth-cookie.service';
import { RefreshToken } from './entities/refresh-tokens.entity';
import { ChangePasswordService } from './services/change-password.service';
import { UserRegisteredListener } from './listeners/user-registered.listener';
import { TokenCleanupService } from './services/token-cleanup.service';

@Module({
  imports: [
    forwardRef(() => UsersModule),
    SecurityModule,
    EmailModule,
    TypeOrmModule.forFeature([AuthToken]),
    TypeOrmModule.forFeature([RefreshToken]),
  ],
  controllers: [
    AuthController,
    EmailVerificationController,
    PasswordController,
  ],
  providers: [
    AuthService,
    EmailVerificationService,
    PasswordResetService,
    CryptoService,
    TokensService,
    TokenCooldownService,
    RefreshTokenService,
    AuthCookieService,
    ChangePasswordService,
    TokenCleanupService,
    UserRegisteredListener,
  ],
  exports: [CryptoService, PasswordResetService],
})
export class AuthModule {}
