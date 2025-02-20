import { CallHandler, ExecutionContext, HttpStatus, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface IReceivedData<T = any> {
  result: T;
  message: string;
  statusCode: HttpStatus;
  count?: number;
}

@Injectable()
export class ResponseInterceptor<T extends IReceivedData<T>> implements NestInterceptor<T> {
  intercept(context: ExecutionContext, next: CallHandler<T>): Observable<any> {
    return next.handle().pipe(
      map((data) => {
        const response = {
          success: true,
          data: data.result,
          message: data.message,
        };

        if (data.count !== undefined) {
          response['count'] = data.count;
        }

        return response;
      }),
    );
  }
}
