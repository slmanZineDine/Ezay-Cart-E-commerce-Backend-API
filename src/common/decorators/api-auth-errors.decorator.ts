import { applyDecorators } from '@nestjs/common';
import { ApiForbiddenResponse, ApiUnauthorizedResponse } from '@nestjs/swagger';

export function ApiAuthErrors() {
  return applyDecorators(
    ApiUnauthorizedResponse({
      description: 'Missing or invalid token',
    }),
    ApiForbiddenResponse({
      description: 'Insufficient permissions',
    }),
  );
}
