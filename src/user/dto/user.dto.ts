import { HttpStatus } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import { Role, User } from '@prisma/client';
import { IsEmail, IsEnum, IsOptional, IsString } from 'class-validator';
import { ResponseWithDataDto } from 'src/constants';

export class UpdateUserDto {
  @ApiProperty({
    example: 'John Doe',
  })
  @IsOptional()
  @IsString()
  @ApiProperty({ description: 'Name of the user', required: false })
  name?: string;

  @ApiProperty({
    example: 'john.doe@email.com',
  })
  @IsOptional()
  @IsEmail()
  @ApiProperty({ description: 'Email of the user', required: false })
  email?: string;

  @IsOptional()
  @ApiProperty({
    example: '+1234567890',
  })
  phone: string;
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

const resultUsers = [
  {
    id: 'a1b2c3d4-e5f6-7g8h-9i0j-k1l2m3n4o5p6',
    email: 'john.doe@email.com',
    name: 'John Doe',
    phone: '+1234567890',
    role: 'SUPER_ADMIN',
    createdAt: '2025-03-29T22:41:58.909Z',
    editedAt: '2025-03-29T22:41:58.909Z',
  },
  {
    id: 'q7r8s9t0-u1v2-w3x4-y5z6-123456789abc',
    email: 'jane.smith@email.com',
    name: 'Jane Smith',
    phone: '+1234567891',
    role: 'USER',
    createdAt: '2025-03-29T23:04:46.689Z',
    editedAt: '2025-03-29T23:04:46.689Z',
  },
  {
    id: 'z9x8y7w6-v5u4-t3s2-r1q0-9876543210ab',
    email: 'robert.brown@email.com',
    name: 'Robert Brown',
    phone: '+1234567892',
    role: 'USER',
    createdAt: '2025-03-30T13:58:10.818Z',
    editedAt: '2025-03-30T13:58:10.818Z',
  },
];

export class ResultFindAllUsersDto extends ResponseWithDataDto {
  @ApiProperty({
    example: resultUsers,
  })
  result: User[];

  @ApiProperty({
    example: 3,
  })
  count: number;
}

export class ResultFindOneUserDto extends ResponseWithDataDto {
  @ApiProperty({
    example: resultUsers[0],
  })
  result: User;

  @ApiProperty({
    example: 1,
  })
  count: number;
}

export class ResultUpdateUserRoleDto extends ResponseWithDataDto {
  @ApiProperty({
    example: resultUsers[0],
  })
  data: any;

  @ApiProperty({
    example: 1,
  })
  count: number;

  @ApiProperty({
    example: 200,
  })
  statusCode: HttpStatus;
}

export class ResultDeleteUserDto extends ResponseWithDataDto {
  @ApiProperty({
    example: { userId: 'mb1231xca12asd1234da' },
  })
  data: any;

  @ApiProperty({
    example: 1,
  })
  count: number;

  @ApiProperty({
    example: 200,
  })
  statusCode: HttpStatus;
}
