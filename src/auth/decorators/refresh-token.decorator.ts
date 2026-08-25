import {
  createParamDecorator,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { REFRESH_TOKEN_COOKIE_NAME } from 'src/utils/constants';

export const RefreshToken = createParamDecorator(
  (data: unknown, context: ExecutionContext) => {
    // Extract the refresh token from the request cookie
    const request = context.switchToHttp().getRequest();

    const refreshToken = request.cookies?.[REFRESH_TOKEN_COOKIE_NAME];

    // Reject the request when the refresh token is missing
    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token is required');
    }

    return refreshToken;
  },
);
