import { HttpStatus } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';

export class BaseResponseDto {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ example: 'Success' })
  message: string;

  @ApiProperty({ example: 200 })
  statusCode: HttpStatus;
}

export class ResponseWithDataDto extends BaseResponseDto {
  @ApiProperty({ example: 10 })
  count?: number;
}

export class ResponseCreatedDto extends BaseResponseDto {
  @ApiProperty({ example: 'Success' })
  message: string;

  @ApiProperty({ example: 201 })
  statusCode: HttpStatus;
}

export class ResponseBadRequestDto extends BaseResponseDto {
  @ApiProperty({ example: false })
  success: boolean;

  @ApiProperty({ example: 'Bad Request' })
  message: string;

  @ApiProperty({ example: 400 })
  statusCode: HttpStatus;
}

export class ResponseUnauthorizedDto {
  @ApiProperty({ example: false })
  success: boolean;

  @ApiProperty({ example: 'Unauthorized' })
  message: string;

  @ApiProperty({ example: 401 })
  statusCode: HttpStatus;
}

export class ResponseForbiddenDto {
  @ApiProperty({ example: false })
  success: boolean;

  @ApiProperty({ example: 'Forbidden' })
  message: string;

  @ApiProperty({ example: 403 })
  statusCode: HttpStatus;
}

export class ResponseNotFoundDto {
  @ApiProperty({ example: false })
  success: boolean;

  @ApiProperty({ example: 404 })
  statusCode: HttpStatus;

  @ApiProperty({ example: 0 })
  count: number;

  @ApiProperty({ example: 'Not Found' })
  message: string;

  @ApiProperty({ example: null })
  data: any;
}

export class ResponseInternalServerErrorDto {
  @ApiProperty({ example: false })
  success: boolean;

  @ApiProperty({ example: 'Internal Server Error' })
  message: string;

  @ApiProperty({ example: 500 })
  statusCode: HttpStatus;
}
