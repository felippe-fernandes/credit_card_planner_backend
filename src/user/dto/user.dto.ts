import { ApiProperty } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { IsEmail, IsEnum, IsOptional, IsString } from 'class-validator';

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  @ApiProperty({ description: 'Name of the user', required: false })
  name?: string;

  @IsOptional()
  @IsEmail()
  @ApiProperty({ description: 'Email of the user', required: false })
  email?: string;
}

export class UpdateUserRoleDto {
  @IsString()
  @ApiProperty({ description: 'ID of the user', required: true })
  userId: string;

  @IsString()
  @IsEnum(Role)
  @ApiProperty({ description: 'New role for the user', required: true, enumName: 'Role' })
  @ApiProperty({ enum: Role, enumName: 'Role' })
  newRole: Role;
}
