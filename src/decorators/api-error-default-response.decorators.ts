import { applyDecorators } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiForbiddenResponse,
  ApiInternalServerErrorResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import {
  ResponseBadRequestDto,
  ResponseForbiddenDto,
  ResponseInternalServerErrorDto,
  ResponseUnauthorizedDto,
} from 'src/constants';

export function ApiErrorDefaultResponses() {
  return applyDecorators(
    ApiBadRequestResponse({ type: ResponseBadRequestDto }),
    ApiUnauthorizedResponse({ type: ResponseUnauthorizedDto }),
    ApiForbiddenResponse({ type: ResponseForbiddenDto }),
    ApiInternalServerErrorResponse({ type: ResponseInternalServerErrorDto }),
  );
}
