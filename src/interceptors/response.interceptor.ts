import { CallHandler, ExecutionContext, HttpStatus, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { PaginationMetaDto } from 'src/common/dto/pagination.dto';

export interface IReceivedData<T = any> {
  result: T;
  message: string;
  statusCode: HttpStatus;
  count?: number;
  meta?: PaginationMetaDto;
}

@Injectable()
export class ResponseInterceptor<T extends IReceivedData<T>> implements NestInterceptor<T> {
  intercept(context: ExecutionContext, next: CallHandler<T>): Observable<any> {
    return next.handle().pipe(
      map((data) => {
        const response = {
          success: true,
          result: data.result,
          message: data.message,
          statusCode: data.statusCode,
        };

        if (data.count !== undefined) {
          response['count'] = data.count;
        }

        if (data.meta !== undefined) {
          response['meta'] = data.meta;
        }

        return response;
      }),
    );
  }
}
