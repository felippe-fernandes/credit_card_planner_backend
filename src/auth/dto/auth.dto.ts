import { HttpStatus } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import { Session } from '@supabase/supabase-js';
import { IsEmail, IsNotEmpty, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import { ResponseWithDataDto } from 'src/constants';

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

export class ResultLoginDto extends ResponseWithDataDto {
  @ApiProperty({
    example: {
      access_token: 'eyJhbGciOiJIUzI1NiIsImtpZCI6IjlENUxoYUM1WjJabzNUM0MiLCJ0eXAiOiJKV1QifQ...',
      token_type: 'bearer',
      expires_in: 3600,
      expires_at: 1743348957,
      refresh_token: 'mCUgtxFs6OOHzxQAL0X9LQ',
      user: {
        id: 'b0d6c695-6501-4d9f-8258-7aa6cc759ab8',
        aud: 'authenticated',
        role: 'authenticated',
        email: 'john.doe@email.com',
        email_confirmed_at: '2025-03-29T23:04:47.37293Z',
        phone: '',
        confirmed_at: '2025-03-29T23:04:47.37293Z',
        last_sign_in_at: '2025-03-30T14:35:57.769736591Z',
        app_metadata: {
          provider: 'email',
          providers: ['email'],
        },
        user_metadata: {
          displayName: 'John Doe',
          email: 'john.doe@email.com',
          email_verified: true,
          phone: '+1234567890',
          phone_verified: false,
          sub: 'b0d6c695-6501-4d9f-8258-7aa6cc759ab8',
        },
        identities: [
          {
            identity_id: '6c913997-faa3-4b32-a534-cc588c307f21',
            id: 'b0d6c695-6501-4d9f-8258-7aa6cc759ab8',
            user_id: 'b0d6c695-6501-4d9f-8258-7aa6cc759ab8',
            identity_data: {
              displayName: 'John Doe',
              email: 'john.doe@email.com',
              email_verified: false,
              phone: '+1234567890',
              phone_verified: false,
              sub: 'b0d6c695-6501-4d9f-8258-7aa6cc759ab8',
            },
            provider: 'email',
            last_sign_in_at: '2025-03-29T23:04:47.369684Z',
            created_at: '2025-03-29T23:04:47.369731Z',
            updated_at: '2025-03-29T23:04:47.369731Z',
            email: 'john.doe@email.com',
          },
        ],
        created_at: '2025-03-29T23:04:47.366323Z',
        updated_at: '2025-03-30T14:35:57.77298Z',
        is_anonymous: false,
      },
    },
  })
  data: Session;

  @ApiProperty({ example: 'Login successful' })
  message: string;

  @ApiProperty({ example: 200 })
  statusCode: HttpStatus;
}

export class ResultSignupDto extends ResponseWithDataDto {
  @ApiProperty({
    example: {
      id: '1234567890',
      email: 'john.doe@email.com',
      name: 'John Doe',
      phone: '+1234567890',
      role: 'USER',
      createdAt: '2023-10-01T00:00:00Z',
      editedAt: '2023-10-01T00:00:00Z',
    },
  })
  data: Session;

  @ApiProperty({
    example: 1,
  })
  count: number;

  @ApiProperty({
    example: 201,
  })
  statusCode: HttpStatus;
}
