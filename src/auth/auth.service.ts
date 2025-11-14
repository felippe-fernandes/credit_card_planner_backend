import {
  BadRequestException,
  ForbiddenException,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { Role, User } from '@prisma/client';
import { Session } from '@supabase/supabase-js';
import { Response } from 'express';
import { PrismaService } from 'prisma/prisma.service';
import { defaultCategories } from 'src/constants/categories';
import { IReceivedData } from 'src/interceptors/response.interceptor';
import { UpdateUserDto } from 'src/user/dto/user.dto';
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

      res.cookie('sb_auth_token', access_token, {
        httpOnly: true,
        secure: true,
        sameSite: 'strict',
        path: '/',
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

    res.clearCookie('sb_auth_token', {
      path: '/',
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
    });

    return {
      statusCode: HttpStatus.OK,
      message: 'Logout successful',
    };
  }

  private async signUpUserWithRole(payload: SignupDto, role: Role): Promise<IReceivedData<User>> {
    const { email, password, name, phone } = payload;
    let supabaseUserId: string | null = null;

    try {
      // Step 1: Create user in Supabase Auth
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        phone,
        options: {
          data: { displayName: name, phone },
          emailRedirectTo: process.env.FRONTEND_URL,
        },
      });

      if (error) {
        throw new BadRequestException({
          statusCode: HttpStatus.BAD_REQUEST,
          message: `Error signing up: ${error.message}`,
        });
      }

      const user = data.user;
      if (!user) {
        throw new BadRequestException({
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'Error retrieving user from Supabase',
        });
      }

      supabaseUserId = user.id;

      // Step 2: Create user in Prisma database
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
              // Removed id field to let Prisma generate unique ID
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
    } catch (error) {
      // Rollback: If Prisma creation failed, delete from Supabase
      if (supabaseUserId) {
        try {
          await supabase.auth.admin.deleteUser(supabaseUserId);
        } catch (deleteError) {
          console.error('Failed to rollback Supabase user:', deleteError);
        }
      }

      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException({
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Error signing up user',
      });
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
    try {
      if (!userId) {
        throw new BadRequestException({
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'User ID is required.',
        });
      }

      // Check if user exists and is not SUPER_ADMIN
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: { role: true },
      });

      if (!user) {
        throw new BadRequestException({
          statusCode: HttpStatus.NOT_FOUND,
          message: 'User not found',
        });
      }

      if (user.role === 'SUPER_ADMIN') {
        throw new ForbiddenException({
          statusCode: HttpStatus.FORBIDDEN,
          message: 'Cannot delete SUPER_ADMIN users',
        });
      }

      // Delete from Prisma database first (triggers cascades)
      await this.prisma.user.delete({ where: { id: userId } });

      // Then delete from Supabase Auth
      const { error } = await supabase.auth.admin.deleteUser(userId);

      if (error) {
        // Log the error but don't fail the operation since DB deletion succeeded
        console.error('Failed to delete user from Supabase Auth:', error);
      }

      // Clear cookie with correct name and options
      res.clearCookie('sb_auth_token', {
        path: '/',
        httpOnly: true,
        secure: true,
        sameSite: 'strict',
      });

      return { message: 'User successfully deleted.' };
    } catch (error) {
      if (error instanceof BadRequestException || error instanceof ForbiddenException) {
        throw error;
      }
      throw new BadRequestException({
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Error deleting user',
      });
    }
  }

  async updateUser(userId: string, updatedUser: UpdateUserDto) {
    try {
      if (!userId) {
        throw new BadRequestException({
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'User ID is required.',
        });
      }

      const { error } = await supabase.auth.admin.updateUserById(userId, updatedUser);

      if (error) {
        if (error.message.includes('User not allowed')) {
          throw new ForbiddenException({
            statusCode: HttpStatus.FORBIDDEN,
            message: 'You are not allowed to update this user.',
          });
        }

        throw new BadRequestException({
          statusCode: HttpStatus.BAD_REQUEST,
          message: `Error updating user: ${error.message}`,
        });
      }

      return { message: 'User successfully updated.' };
    } catch (error) {
      if (error instanceof BadRequestException || error instanceof ForbiddenException) {
        throw error;
      }
      throw new BadRequestException({
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Error updating user',
      });
    }
  }
}
