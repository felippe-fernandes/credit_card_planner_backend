import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class SignupDto {
  @IsEmail()
  @ApiProperty({
    description: 'User email',
    example: 'john.doe@email.com',
  })
  email: string;

  @IsString()
  @MinLength(6)
  @MaxLength(20)
  @ApiProperty({
    description: 'User password',
    example: 'password123',
  })
  password: string;

  @IsString()
  @MinLength(3)
  @IsNotEmpty()
  @ApiProperty({
    description: 'User name',
    example: 'John Doe',
  })
  name: string;

  @IsOptional()
  @ApiProperty({
    description: 'User phone number',
    example: '+1234567890',
  })
  phone: string;
}

export class LoginDto {
  @IsEmail()
  @ApiProperty({
    description: 'User email',
    example: 'john.doe@email.com',
  })
  email: string;

  @IsString()
  @MinLength(6)
  @MaxLength(20)
  @ApiProperty({
    description: 'User password',
    example: 'password123',
  })
  password: string;
}
