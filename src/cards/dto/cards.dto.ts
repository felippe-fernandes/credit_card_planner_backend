import { HttpStatus } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import {
  IsDate,
  IsDecimal,
  IsInt,
  IsNumber,
  IsNumberString,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';
import { PaginationDto } from 'src/common/dto/pagination.dto';
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

export class FindAllCardsDto extends PaginationDto {
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

const resultSearchCard = [
  {
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
  },
  {
    id: '67890',
    userId: '67890',
    name: 'My Card 2',
    bank: 'Bank Name 2',
    flag: 'Mastercard',
    limit: '5000.00',
    dueDay: 25,
    payDay: 1,
    availableLimit: '5000.00',
    simulatedLimit: '0',
    createdAt: '2023-01-01T00:00:00Z',
    editedAt: '2023-01-01T00:00:00Z',
  },
];

export class CardDto {
  @ApiProperty({ example: 'a1b2c3d4-e5f6-7g8h-9i0j-k1l2m3n4o5p6' })
  @IsString()
  id: string;

  @ApiProperty({ example: 'Nubank Platinum' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'user-123' })
  @IsString()
  userId: string;

  @ApiProperty({ example: '2025-04-01T12:00:00.000Z' })
  @IsDate()
  createdAt: Date;

  @ApiProperty({ example: '2025-04-02T12:00:00.000Z', nullable: true })
  @IsOptional()
  @IsDate()
  editedAt: Date | null;

  @ApiProperty({ example: 'Nubank' })
  @IsString()
  bank: string;

  @ApiProperty({ example: 'Visa' })
  @IsString()
  flag: string;

  @ApiProperty({ example: '5000.00', description: 'Credit limit', type: String })
  @IsString()
  limit: string;

  @ApiProperty({ example: 10, description: 'Due day' })
  @IsNumber()
  dueDay: number;

  @ApiProperty({ example: 5, description: 'Pay day' })
  @IsNumber()
  payDay: number;

  @ApiProperty({ example: '3500.00', description: 'Available limit', type: String })
  @IsString()
  availableLimit: string;

  @ApiProperty({ example: '4200.00', description: 'Simulated limit', type: String })
  @IsString()
  simulatedLimit: string;
}

export class ResultFindAllCardDto extends ResponseWithDataDto {
  @ApiProperty({
    example: resultSearchCard,
  })
  result: CardDto[];
}

export class ResultFindOneCardDto extends ResponseWithDataDto {
  @ApiProperty({
    example: resultSearchCard[0],
  })
  result: CardDto;

  @ApiProperty({
    example: 1,
  })
  count: number;
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
  result: any;

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
  result: any;

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
  result: any;

  @ApiProperty({
    example: 1,
  })
  count: number;

  @ApiProperty({
    example: 200,
  })
  statusCode: HttpStatus;
}
