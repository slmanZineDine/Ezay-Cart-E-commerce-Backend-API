import { Injectable, UnauthorizedException } from '@nestjs/common';
import { RegisterUserDto } from '../dto/register.user.dto';
import { UserRole } from 'src/utils/enums';
import { LoginDto } from '../dto/login.user.dto';
import { UsersService } from 'src/users/users.service';
import { EmailService } from 'src/common/modules/email/email.service';
import { EmailVerificationService } from './email-verification.service';
import { CryptoService } from './crypto.service';
import { EmailNotVerifiedException } from 'src/common/exceptions/email-not-verified.exception';
import { RefreshTokenService } from './refresh-token.service';
import { AuthRequestContext } from '../decorators/auth-context.decorator';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { UserRegisteredEvent } from '../events/user-registered.event';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly cryptoService: CryptoService,
    private readonly refreshTokenService: RefreshTokenService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  // -------------------------
  // REGISTER
  // -------------------------
  async register(dto: RegisterUserDto) {
    const existingUser = await this.usersService.findByEmail(dto.email);

    if (existingUser) {
      throw new UnauthorizedException('Email already exists');
    }

    // 1. Create the user through UsersService
    const newUser = await this.usersService.create({
      ...dto,
      role: UserRole.USER,
    });

    // 2. Generate and save the token
    // const rawToken = await this.emailVerificationService.generateAndSaveToken(
    //   newUser.id,
    // );

    // 3. Send the RAW token to the user via email service
    // await this.emailService.sendVerificationEmail(
    //   dto.email,
    //   dto.username,
    //   rawToken,
    // );

    // 2. Observer Pattern:Emit the UserRegisteredEvent
    this.eventEmitter.emit(
      'user.registered',
      new UserRegisteredEvent(newUser.id, newUser.email, newUser.username),
    );

    return {
      message:
        'Registration successful. Please check your email to verify your account.',
    };
  }

  // -------------------------
  // LOGIN
  // -------------------------
  async login(dto: LoginDto, context: AuthRequestContext) {
    // 1. Find the user by email, including the password hash
    const user = await this.usersService.findByEmailWithPassword(dto.email);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // 2. Verify the provided password against the stored password hash
    const isPasswordValid = await this.cryptoService.compare(
      dto.password,
      user.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // 3. Ensure the user has verified their email before logging in
    if (!user.emailVerified) {
      throw new EmailNotVerifiedException();
    }

    // 4. Generate a new access token and refresh token
    const { accessToken, refreshToken } =
      await this.refreshTokenService.issueTokens(user, context);

    // 5. Return the authentication result and safe user data
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
  // FACADE METHODS FOR CONTROLLER
  // -------------------------
  async refreshSession(refreshToken: string, context: AuthRequestContext) {
    return this.refreshTokenService.refresh(refreshToken, context);
  }

  async logoutUser(refreshToken: string) {
    return this.refreshTokenService.revoke(refreshToken);
  }
}
