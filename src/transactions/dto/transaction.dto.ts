import { IsDateString, IsDecimal, IsInt, IsNumberString, IsOptional, IsString } from 'class-validator';

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

  @IsDateString()
  date: string;

  @IsString()
  @IsOptional()
  dependentId: string;
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

  @IsDateString()
  @IsOptional()
  date?: string;

  @IsString()
  @IsOptional()
  dependentId: string;
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
}

export class FindOneTransactionDto {
  @IsString()
  @IsOptional()
  id?: string;

  @IsString()
  @IsOptional()
  purchaseName?: string;
}
