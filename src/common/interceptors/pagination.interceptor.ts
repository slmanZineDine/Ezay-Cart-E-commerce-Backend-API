import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { map, Observable } from 'rxjs';

@Injectable()
export class PaginationInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();

    const page = Number(request.query.page) || 1;
    const limit = Number(request.query.limit) || 10;

    return next.handle().pipe(
      map((response) => {
        if (response && response.items && typeof response.total === 'number') {
          return {
            data: response.items,
            meta: {
              total: response.total,
              page,
              limit,
              totalPages: Math.ceil(response.total / limit),
            },
          };
        }
        return response;
      }),
    );
  }
}
