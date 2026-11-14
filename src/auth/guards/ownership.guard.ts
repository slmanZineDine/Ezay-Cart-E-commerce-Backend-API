import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Type,
  mixin,
  BadRequestException,
} from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { FindOneOptions } from 'typeorm';

interface ResourceService {
  findOne(id: number, options?: FindOneOptions<any>): Promise<any>; // Return type is any for flexibility
}

export function CreateOwnershipGuard(serviceToken: Type<ResourceService>) {
  @Injectable()
  class OwnershipGuard implements CanActivate {
    constructor(public moduleRef: ModuleRef) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
      const request = context.switchToHttp().getRequest();
      const user = request.user;
      const resourceId = request.params.id;

      if (!user) return false;
      if (!resourceId || !/^\d+$/.test(resourceId as string)) {
        throw new BadRequestException(
          'Validation failed (numeric string is expected)',
        );
      }

      // Admins bypass the ownership check
      if (user.role === 'ADMIN') return true;

      const service = this.moduleRef.get(serviceToken, { strict: false });
      const resource = await service.findOne(+resourceId);

      if (!resource || resource.userId !== user.sub) {
        throw new ForbiddenException(
          "You don't have permission to modify this resource.",
        );
      }

      // 💡 Store the fetched resource in the request object!
      // This prevents the Controller/Service from querying the database again.
      request.resource = resource;

      return true;
    }
  }

  return mixin(OwnershipGuard);
}
