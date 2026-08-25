import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const CurrentResource = createParamDecorator(
  (data: unknown, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest();

    return request.resource; // This is set by the OwnershipGuard;
  },
);
