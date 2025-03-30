import { HttpStatus } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import { Card } from '@prisma/client';
import { IsDecimal, IsInt, IsNumberString, IsOptional, IsString, Max, Min } from 'class-validator';
import { ResponseWithDataDto } from 'src/constants';

export class CreateCardDto {
  @ApiProperty({ example: 'My Card' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'Bank Name' })
  @IsString()
  bank: string;

  @ApiProperty({ example: 'Visa' })
  @IsString()
  flag: string;

  @ApiProperty({ example: '1000.00' })
  @IsDecimal({ decimal_digits: '2' })
  @IsNumberString()
  limit: string;

  @ApiProperty({ example: 15 })
  @IsInt()
  @Min(1)
  @Max(31)
  dueDay: number;

  @ApiProperty({ example: 30 })
  @IsInt()
  @Min(1)
  @Max(31)
  payDay: number;
}

export class UpdateCardDto {
  @ApiProperty({ example: 'My Card' })
  @IsOptional()
  @IsString()
  name: string;

  @ApiProperty({ example: 'Bank Name' })
  @IsOptional()
  @IsString()
  bank: string;

  @ApiProperty({ example: 'Visa' })
  @IsOptional()
  @IsString()
  flag: string;

  @ApiProperty({ example: '1000.00' })
  @IsOptional()
  @IsDecimal({ decimal_digits: '2' })
  @IsNumberString()
  limit: string;

  @ApiProperty({ example: 15 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(31)
  dueDay: number;

  @ApiProperty({ example: 30 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(31)
  payDay: number;
}

export class FindOneCardDto {
  @IsOptional()
  @IsString()
  id?: string;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  bank?: string;
}

export class FindAllCardsDto {
  @IsOptional()
  @IsString()
  flag?: string;

  @IsOptional()
  @IsString()
  bank?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(31)
  dueDay?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(31)
  payDay?: number;

  @IsOptional()
  @IsString()
  name?: string;
}

const resultSearchCard = {
  id: '12345',
  userId: '67890',
  name: 'My Card',
  bank: 'Bank Name',
  flag: 'Visa',
  limit: '1000.00',
  dueDay: 15,
  payDay: 30,
  availableLimit: '800.00',
  simulatedLimit: '0',
  createdAt: '2023-01-01T00:00:00Z',
  editedAt: '2023-01-01T00:00:00Z',
};

export class ResultFindAllCardDto extends ResponseWithDataDto {
  @ApiProperty({
    example: [resultSearchCard],
  })
  result: Card[];
}

export class ResultFindOneCardDto extends ResponseWithDataDto {
  @ApiProperty({
    example: resultSearchCard,
  })
  result: Card;
}

const resultCreateCard = {
  id: 'cm8vsfvyx0001wce8b40bhum2',
  userId: 'd5147b61-90d2-4b19-a987-c32e5e47e220',
  name: 'Itau Latam',
  bank: 'Itau',
  flag: 'Visa',
  limit: '18000',
  dueDay: 25,
  payDay: 1,
  availableLimit: '0',
  simulatedLimit: '0',
  createdAt: '2025-03-30T15:21:30.777Z',
  editedAt: '2025-03-30T15:21:30.777Z',
};

export class ResultCreateCardDto extends ResponseWithDataDto {
  @ApiProperty({
    example: resultCreateCard,
  })
  data: any;

  @ApiProperty({
    example: 1,
  })
  count: number;

  @ApiProperty({
    example: 201,
  })
  statusCode: HttpStatus;
}

export class ResultUpdateCardDto extends ResponseWithDataDto {
  @ApiProperty({
    example: resultCreateCard,
  })
  data: any;

  @ApiProperty({
    example: 1,
  })
  count: number;

  @ApiProperty({
    example: 200,
  })
  statusCode: HttpStatus;
}

export class ResultDeleteCardDto extends ResponseWithDataDto {
  @ApiProperty({
    example: { cardId: 'mb1231xcaasd1234da' },
  })
  data: any;

  @ApiProperty({
    example: 1,
  })
  count: number;

  @ApiProperty({
    example: 200,
  })
  statusCode: HttpStatus;
}
