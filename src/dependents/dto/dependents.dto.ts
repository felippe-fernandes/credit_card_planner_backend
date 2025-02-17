import { PartialType } from '@nestjs/mapped-types';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateDependentDto {
  @IsNotEmpty()
  @IsString()
  name: string;
}

export class UpdateDependentDto extends PartialType(CreateDependentDto) {}

export class FindAllDependentsDto {
  @IsOptional()
  @IsString()
  dependentId?: string;

  @IsOptional()
  @IsString()
  name?: string;
}

export class FindOneDependentDto {
  @IsString()
  @IsOptional()
  id?: string;

  @IsString()
  @IsOptional()
  name?: string;
}
