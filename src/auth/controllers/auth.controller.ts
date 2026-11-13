import {
  Body,
  Controller,
  HttpCode,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { RegisterUserDto } from '../dto/register.user.dto';
import { LoginDto } from '../dto/login.user.dto';
import { AuthService } from '../services/auth.service';
import { RefreshToken } from '../decorators/refresh-token.decorator';
import {
  AuthContext,
  type AuthRequestContext,
} from '../decorators/auth-context.decorator';
import { AuthCookieService } from '../services/auth-cookie.service';
import { type Response } from 'express';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly authCookieService: AuthCookieService,
  ) {}

  // -------------------------
  // REGISTER
  // POST /auth/register
  // -------------------------

  @Post('register')
  @Throttle({ default: { limit: 3, ttl: 60000 } }) // Allow maximum 3 registration requests per 60 seconds
  @ApiOperation({
    summary: 'Register a new user',
    description: 'Creates a new user account.',
  })
  async register(@Body() dto: RegisterUserDto) {
    return this.authService.register(dto);
  }

  // -------------------------
  // LOGIN
  // POST /auth/login
  // -------------------------

  @Post('login')
  @Throttle({ default: { limit: 5, ttl: 60000 } }) // Allow maximum 5 login attempts per 60 seconds to prevent brute force
  @HttpCode(200)
  @ApiOperation({
    summary: 'Login user',
    description:
      'Authenticates the user and returns an access token while setting a refresh token cookie.',
  })
  async login(
    @Body() dto: LoginDto,
    @AuthContext() context: AuthRequestContext,
    @Res({ passthrough: true }) response: Response,
  ) {
    const result = await this.authService.login(dto, context);

    this.authCookieService.setRefreshToken(response, result.refreshToken);

    return {
      accessToken: result.accessToken,
      user: result.user,
    };
  }

  // -------------------------
  // REFRESH
  // POST /auth/refresh
  // -------------------------

  @Post('refresh')
  @HttpCode(200)
  @ApiOperation({
    summary: 'Refresh access token',
    description: 'Rotates the refresh token and returns a new access token.',
  })
  async refresh(
    @RefreshToken() refreshToken: string,
    @AuthContext() context: AuthRequestContext,
    @Res({ passthrough: true }) response: Response,
  ) {
    const result = await this.authService.refreshSession(refreshToken, context);

    // Replace the old refresh token with the newly rotated token
    this.authCookieService.setRefreshToken(response, result.refreshToken);

    return {
      accessToken: result.accessToken,
    };
  }

  // -------------------------
  // LOGOUT
  // POST /auth/logout
  // -------------------------

  @Post('logout')
  @ApiBearerAuth()
  @HttpCode(200)
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Logout user',
    description:
      'Revokes the current refresh token and clears the refresh token cookie.',
  })
  async logout(
    @RefreshToken() refreshToken: string,
    @Res({ passthrough: true }) response: Response,
  ) {
    const result = await this.authService.logoutUser(refreshToken);

    this.authCookieService.clearRefreshToken(response);

    return result;
  }
}
