import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from '@nestjs/common';
import { Response } from 'express';

interface ErrorResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data?: null;
  count?: number;
}

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = exception.getStatus ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;

    const exceptionResponse = exception.getResponse();
    const message =
      typeof exceptionResponse === 'string'
        ? exceptionResponse
        : typeof exceptionResponse === 'object' && 'message' in exceptionResponse
          ? (exceptionResponse.message as string)
          : 'Internal server error';

    const errorResponse: ErrorResponse = {
      success: false,
      statusCode: status,
      message,
    };

    if (status === (HttpStatus.NOT_FOUND as number)) {
      errorResponse.data = null;
      errorResponse.count = 0;
    }

    response.status(status).json(errorResponse);
  }
}
