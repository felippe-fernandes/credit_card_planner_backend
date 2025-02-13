import { IsDateString, IsDecimal, IsInt, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateTransactionDto {
  @IsString()
  @IsUUID()
  cardId: string;

  @IsString()
  purchaseName: string;

  @IsString()
  purchaseCategory: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsDecimal()
  amount: number;

  @IsInt()
  installments: number;

  @IsDateString()
  date: string;
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

  @IsDecimal()
  @IsOptional()
  amount?: number;

  @IsInt()
  @IsOptional()
  installments?: number;

  @IsDateString()
  @IsOptional()
  date?: string;
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
  @IsDecimal()
  amount?: number;

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
