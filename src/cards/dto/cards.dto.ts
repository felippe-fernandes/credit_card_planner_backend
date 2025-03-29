import { ApiProperty } from '@nestjs/swagger';
import { Card } from '@prisma/client';
import { IsDecimal, IsInt, IsNumberString, IsOptional, IsString, Max, Min } from 'class-validator';
import { ReceivedDataDto } from 'src/constants';

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
  @IsOptional()
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  bank: string;

  @IsOptional()
  @IsString()
  flag: string;

  @IsOptional()
  @IsDecimal({ decimal_digits: '2' })
  @IsNumberString()
  limit: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(31)
  dueDay: number;

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

export class ResultCardDto extends ReceivedDataDto {
  @ApiProperty({
    example: [
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
    ],
  })
  result: Card[];
}
