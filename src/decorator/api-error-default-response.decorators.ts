import { applyDecorators } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import {
  ResponseBadRequestDto,
  ResponseForbiddenDto,
  ResponseNotFoundDto,
  ResponseUnauthorizedDto,
} from 'src/constants';

export function ApiErrorDefaultResponses() {
  return applyDecorators(
    ApiBadRequestResponse({ type: ResponseBadRequestDto }),
    ApiUnauthorizedResponse({ type: ResponseUnauthorizedDto }),
    ApiForbiddenResponse({ type: ResponseForbiddenDto }),
    ApiNotFoundResponse({ type: ResponseNotFoundDto }),
  );
}
