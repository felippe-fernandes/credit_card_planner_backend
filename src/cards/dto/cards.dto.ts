import { IsDecimal, IsInt, IsNumberString, IsOptional, IsString, Max, Min } from 'class-validator';

export class CreateCardDto {
  @IsString()
  name: string;

  @IsString()
  bank: string;

  @IsString()
  flag: string;

  @IsDecimal({ decimal_digits: '2' })
  @IsNumberString()
  limit: string;

  @IsInt()
  @Min(1)
  @Max(31)
  dueDay: number;

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
