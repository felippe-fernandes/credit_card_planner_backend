import { IsDecimal, IsInt, IsNotEmpty, IsString } from 'class-validator';

export class CreateCardDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  bank: string;

  @IsString()
  @IsNotEmpty()
  flag: string;

  @IsDecimal()
  limit: number;

  @IsInt()
  dueDay: number;

  @IsInt()
  payDay: number;
}
