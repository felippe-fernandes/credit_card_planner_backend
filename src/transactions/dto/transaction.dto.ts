import { Transaction } from '@prisma/client';
import {
  ArrayMinSize,
  ArrayNotEmpty,
  IsArray,
  IsDateString,
  IsDecimal,
  IsInt,
  IsNumberString,
  IsOptional,
  IsString,
  Matches,
  ValidateIf,
} from 'class-validator';

export class CreateTransactionDto {
  @IsString()
  cardId: string;

  @IsString()
  purchaseName: string;

  @IsString()
  purchaseCategory: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumberString()
  @IsDecimal()
  amount: number;

  @IsInt()
  installments: number;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateIf((obj: Transaction) => obj.installments > 1)
  @IsDecimal({}, { each: true })
  @IsOptional()
  installmentValues?: number[];

  @IsDateString()
  @IsOptional()
  purchaseDate?: string;

  @IsString()
  @IsOptional()
  dependentId?: string;
}

export class UpdateTransactionDto {
  @IsString()
  @IsOptional()
  purchaseName?: string;

  @IsString()
  @IsOptional()
  purchaseCategory?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumberString()
  @IsDecimal()
  @IsOptional()
  amount?: number;

  @IsInt()
  @IsOptional()
  installments?: number;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateIf((obj: Transaction) => obj.installments > 1)
  @IsDecimal({}, { each: true })
  @IsOptional()
  installmentValues?: number[];

  @IsDateString()
  @IsOptional()
  purchaseDate?: string;

  @IsString()
  @IsOptional()
  dependentId?: string;
}

export class FindAllTransactionsDto {
  @IsOptional()
  @IsString()
  card?: string;

  @IsOptional()
  @IsString()
  dependent?: string;

  @IsOptional()
  @IsString()
  purchaseName?: string;

  @IsOptional()
  @IsString()
  purchaseCategory?: string;

  @IsOptional()
  @IsInt()
  installments?: number;

  @IsOptional()
  @IsDateString()
  purchaseDate?: string;

  @IsOptional()
  @IsArray()
  @ArrayNotEmpty()
  @Matches(/^(0[1-9]|1[0-2])\/\d{4}$/, {
    each: true,
    message: 'Each date in installmentsMonth must be in the format MM/YYYY',
  })
  installmentDates?: string[];
}

export class FindOneTransactionDto {
  @IsString()
  @IsOptional()
  id?: string;

  @IsString()
  @IsOptional()
  purchaseName?: string;

  @IsString()
  @IsOptional()
  dependentId?: string;

  @IsString()
  @IsOptional()
  cardId?: string;

  @IsString()
  @IsOptional()
  purchaseCategory?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsOptional()
  @IsDateString()
  purchaseDate?: string;

  @IsOptional()
  @IsNumberString()
  @IsInt()
  installments?: string;
}
