import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

import { JwtService } from '@nestjs/jwt';

import { JwtPayload } from '../interfaces/jwt-payload.interface';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    // Get the incoming HTTP request
    const request = context.switchToHttp().getRequest();

    // Read authorization header
    const authHeader = request.headers.authorization;

    // Check if token exists
    if (!authHeader) {
      throw new UnauthorizedException('No token provided');
    }

    // Extract token from:
    // "Bearer token_here"
    const [type, token] = authHeader.split(' ') || [];

    // Check if token exists after split
    if (type !== 'Bearer' || !token) {
      throw new UnauthorizedException('Invalid token format');
    }

    try {
      // Verify and decode JWT token
      const payload: JwtPayload = this.jwtService.verify(token as string, {
        secret: this.configService.getOrThrow<string>('JWT_SECRET'),
      });

      // Attach user data to request
      request.user = payload;

      // Allow request to continue
      return true;
    } catch (error) {
      console.error('JWT verification failed:', error);
      // Reject invalid or expired token
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}
