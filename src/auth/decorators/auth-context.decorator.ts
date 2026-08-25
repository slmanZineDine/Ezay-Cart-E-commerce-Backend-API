import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export interface AuthRequestContext {
  userAgent?: string;
  ipAddress?: string;
}

export const AuthContext = createParamDecorator(
  (_data: unknown, context: ExecutionContext): AuthRequestContext => {
    // Extract authentication-related request metadata
    const request = context.switchToHttp().getRequest();

    return {
      userAgent: request.get('user-agent'),
      ipAddress: request.ip,
    };
  },
);
