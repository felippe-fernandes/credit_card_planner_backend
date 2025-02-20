import { BadRequestException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { User } from '@prisma/client';
import { PostgrestError } from '@supabase/supabase-js';
import { PrismaService } from 'prisma/prisma.service';
import { supabase } from 'src/auth/supabase.client';
import { IReceivedData } from 'src/interceptors/response.interceptor';
import { UpdateUserDto, UpdateUserRoleDto } from './dto/user.dto';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async findAll(): Promise<IReceivedData<User[]>> {
    try {
      const usersCount = await this.prisma.user.count();

      const users = await this.prisma.user.findMany();
      if (users.length === 0) {
        throw new NotFoundException({
          statusCode: HttpStatus.NOT_FOUND,
          message: 'No users found',
          count: 0,
          data: null,
        });
      }
      return {
        statusCode: HttpStatus.OK,
        message: 'Users retrieved successfully',
        count: usersCount,
        result: users,
      };
    } catch {
      throw new BadRequestException({
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Failed to retrieve users',
      });
    }
  }

  async findOne(id: string): Promise<IReceivedData<User>> {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id },
      });
      if (!user) {
        throw new NotFoundException({
          statusCode: HttpStatus.NOT_FOUND,
          message: `User with id ${id} not found`,
          count: 0,
          data: null,
        });
      }
      return {
        statusCode: HttpStatus.OK,
        message: 'User retrieved successfully',
        count: 1,
        result: user,
      };
    } catch {
      throw new BadRequestException({
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Failed to retrieve user',
      });
    }
  }

  async update(userId: string, updateUserDto: UpdateUserDto): Promise<IReceivedData<User>> {
    try {
      const updatedUser = await this.prisma.user.update({
        where: { id: userId },
        data: updateUserDto,
      });
      return {
        statusCode: HttpStatus.OK,
        message: 'User updated successfully',
        count: 1,
        result: updatedUser,
      };
    } catch (error: unknown) {
      if ((error as PostgrestError).code === 'P2002') {
        throw new BadRequestException({
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'Error updating user: Duplicate value found',
        });
      } else {
        throw new NotFoundException({
          statusCode: HttpStatus.NOT_FOUND,
          message: `User with id ${userId} not found`,
        });
      }
    }
  }

  async updateRole(updateUserRoleDto: UpdateUserRoleDto): Promise<IReceivedData<User>> {
    try {
      const updatedUser = await this.prisma.user.update({
        where: { id: updateUserRoleDto.userId },
        data: {
          role: updateUserRoleDto.newRole,
        },
      });
      return {
        statusCode: HttpStatus.OK,
        message: 'User role updated successfully',
        count: 1,
        result: updatedUser,
      };
    } catch (error: unknown) {
      if ((error as PostgrestError).code === 'P2002') {
        throw new BadRequestException({
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'Error updating user role: Duplicate value found',
        });
      }
      throw new NotFoundException({
        statusCode: HttpStatus.NOT_FOUND,
        message: `User with id ${updateUserRoleDto.userId} not found`,
      });
    }
  }

  async remove(id: string): Promise<IReceivedData> {
    try {
      await this.prisma.user.delete({
        where: { id },
      });

      await supabase.auth.admin.deleteUser(id);

      return {
        result: null,
        statusCode: HttpStatus.OK,
        message: 'User deleted successfully',
      };
    } catch {
      throw new NotFoundException({
        statusCode: HttpStatus.NOT_FOUND,
        message: `User with id ${id} not found`,
      });
    }
  }
}
