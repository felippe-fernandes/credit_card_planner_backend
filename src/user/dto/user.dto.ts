import { Role } from '@prisma/client';
import { IsEmail, IsOptional, IsString } from 'class-validator';

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsEmail()
  email?: string;
}

export class UpdateUserRoleDto {
  @IsString()
  userId?: string;

  @IsString()
  newRole?: Role;
}
