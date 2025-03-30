import {
  BadRequestException,
  ForbiddenException,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { Role, User } from '@prisma/client';
import { PostgrestError, Session } from '@supabase/supabase-js';
import { Response } from 'express';
import { PrismaService } from 'prisma/prisma.service';
import { defaultCategories } from 'src/constants/categories';
import { IReceivedData } from 'src/interceptors/response.interceptor';
import { LoginDto, SignupDto } from './dto/auth.dto';
import { supabase } from './supabase.client';

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService) {}

  async signIn(payload: LoginDto, res: Response): Promise<IReceivedData<Session>> {
    const { email, password } = payload;
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw new HttpException(`Login failed: ${error.message}`, HttpStatus.UNAUTHORIZED);
      }

      if (!data.session) {
        throw new HttpException('Invalid session', HttpStatus.UNAUTHORIZED);
      }

      const { access_token } = data.session;

      res.cookie('auth_token', access_token, {
        httpOnly: true,
        secure: true,
        sameSite: 'strict',
        maxAge: 60 * 60 * 1000,
      });

      return {
        message: 'Login successful',
        result: data.session,
        statusCode: HttpStatus.OK,
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      } else {
        throw new HttpException('Error logging in', HttpStatus.INTERNAL_SERVER_ERROR);
      }
    }
  }

  async signOut(res: Response): Promise<Omit<IReceivedData, 'result'>> {
    const { error } = await supabase.auth.signOut();

    if (error) {
      throw new BadRequestException({
        statusCode: HttpStatus.BAD_REQUEST,
        message: `Error logging out: ${error.message}`,
      });
    }

    res.clearCookie('auth_token');

    return {
      statusCode: HttpStatus.OK,
      message: 'Logout successful',
    };
  }

  private async signUpUserWithRole(payload: SignupDto, role: Role): Promise<IReceivedData<User>> {
    const { email, password, name, phone } = payload;

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      phone,
      options: {
        data: { displayName: name, phone },
      },
    });

    if (error) {
      throw new HttpException(`Error signing up: ${error.message}`, HttpStatus.BAD_REQUEST);
    }

    const user = data.user;
    if (!user) {
      throw new HttpException('Error retrieving user from Supabase', HttpStatus.INTERNAL_SERVER_ERROR);
    }

    try {
      const newUser = await this.prisma.user.create({
        data: {
          id: user.id,
          email,
          name,
          phone,
          role,
          dependents: {
            create: {
              name,
              id: user.id,
            },
          },
          categories: {
            create: defaultCategories,
          },
        },
      });

      return {
        statusCode: HttpStatus.CREATED,
        count: 1,
        message: `${role} successfully created`,
        result: newUser,
      };
    } catch (ex) {
      const error = ex as PostgrestError;
      await supabase.auth.admin.deleteUser(user.id);
      if (error.code === 'P2002') {
        throw new BadRequestException({
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'Email already exists.',
        });
      }
      if (error.code === 'P2003') {
        throw new BadRequestException({
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'Invalid phone number.',
        });
      }
      if (error.code === 'P2025') {
        throw new BadRequestException({
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'User not found.',
        });
      }
      throw new HttpException('Error saving user to the database', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  signUpUser(payload: SignupDto) {
    return this.signUpUserWithRole(payload, 'USER');
  }

  signUpAdmin(payload: SignupDto) {
    return this.signUpUserWithRole(payload, 'ADMIN');
  }

  signUpSuperAdmin(payload: SignupDto) {
    return this.signUpUserWithRole(payload, 'SUPER_ADMIN');
  }

  async deleteUser(userId: string, res: Response) {
    if (!userId) {
      throw new BadRequestException({
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'User ID is required.',
      });
    }

    const { error } = await supabase.auth.admin.deleteUser(userId);

    if (error) {
      if (error.message.includes('User not allowed')) {
        throw new ForbiddenException({
          statusCode: HttpStatus.FORBIDDEN,
          message: 'You are not allowed to delete this user.',
        });
      }

      throw new BadRequestException({
        statusCode: HttpStatus.BAD_REQUEST,
        message: `Error deleting user: ${error.message}`,
      });
    }

    res.clearCookie('auth_token');

    return { message: 'User successfully deleted.' };
  }
}
