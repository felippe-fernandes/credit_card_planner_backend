import { HttpStatus } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
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

export class UserAppMetadataDto {
  @ApiProperty()
  provider: string;

  @ApiProperty({ type: [String] })
  providers: string[];
}

export class UserMetadataDto {
  @ApiProperty()
  displayName: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  email_verified: boolean;

  @ApiProperty()
  phone: string;

  @ApiProperty()
  phone_verified: boolean;

  @ApiProperty()
  sub: string;
}

export class UserIdentityDto {
  @ApiProperty()
  identity_id: string;

  @ApiProperty()
  id: string;

  @ApiProperty()
  user_id: string;

  @ApiProperty({ type: () => UserMetadataDto })
  identity_data: UserMetadataDto;

  @ApiProperty()
  provider: string;

  @ApiProperty()
  last_sign_in_at: string;

  @ApiProperty()
  created_at: string;

  @ApiProperty()
  updated_at: string;

  @ApiProperty()
  email: string;
}

export class AuthUserDto {
  @ApiProperty()
  id: string;

  @ApiProperty({ type: () => UserAppMetadataDto })
  app_metadata: UserAppMetadataDto;

  @ApiProperty({ type: () => UserMetadataDto })
  user_metadata: UserMetadataDto;

  @ApiProperty()
  aud: string;

  @ApiProperty({ required: false })
  confirmation_sent_at?: string;

  @ApiProperty({ required: false })
  recovery_sent_at?: string;

  @ApiProperty({ required: false })
  email_change_sent_at?: string;

  @ApiProperty({ required: false })
  new_email?: string;

  @ApiProperty({ required: false })
  new_phone?: string;

  @ApiProperty({ required: false })
  invited_at?: string;

  @ApiProperty({ required: false })
  action_link?: string;

  @ApiProperty({ required: false })
  email?: string;

  @ApiProperty({ required: false })
  phone?: string;

  @ApiProperty()
  created_at: string;

  @ApiProperty({ required: false })
  confirmed_at?: string;

  @ApiProperty({ required: false })
  email_confirmed_at?: string;

  @ApiProperty({ required: false })
  phone_confirmed_at?: string;

  @ApiProperty({ required: false })
  last_sign_in_at?: string;

  @ApiProperty({ required: false })
  role?: string;

  @ApiProperty({ required: false })
  updated_at?: string;

  @ApiProperty({ type: [UserIdentityDto], required: false })
  identities?: UserIdentityDto[];

  @ApiProperty({ required: false })
  is_anonymous?: boolean;

  @ApiProperty({ required: false })
  is_sso_user?: boolean;
}

export class SessionDto {
  @ApiProperty({ required: false, nullable: true })
  provider_token?: string | null;

  @ApiProperty({ required: false, nullable: true })
  provider_refresh_token?: string | null;

  @ApiProperty()
  access_token: string;

  @ApiProperty()
  refresh_token: string;

  @ApiProperty()
  expires_in: number;

  @ApiProperty({ required: false })
  expires_at?: number;

  @ApiProperty()
  token_type: string;

  @ApiProperty({ type: () => AuthUserDto })
  user: AuthUserDto;
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
  result: SessionDto;

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
  result: SessionDto;

  @ApiProperty({
    example: 1,
  })
  count: number;

  @ApiProperty({
    example: 201,
  })
  statusCode: HttpStatus;
}
