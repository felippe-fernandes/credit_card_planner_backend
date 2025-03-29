import { HttpStatus } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';

export class ReceivedDataDto {
  @ApiProperty({ example: 'Success' })
  message: string;

  @ApiProperty({ example: 200 })
  statusCode: HttpStatus;

  @ApiProperty({ example: 10 })
  count?: number;
}
