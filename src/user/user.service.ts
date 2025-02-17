import { BadRequestException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { PostgrestError } from '@supabase/supabase-js';
import { PrismaService } from 'prisma/prisma.service';
import { supabase } from 'src/auth/supabase.client';
import { UpdateUserDto, UpdateUserRoleDto } from './dto/user.dto';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
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
        data: users,
      };
    } catch {
      throw new BadRequestException({
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Failed to retrieve users',
      });
    }
  }

  async findOne(id: string) {
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
        data: user,
      };
    } catch {
      throw new BadRequestException({
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Failed to retrieve user',
      });
    }
  }

  async update(userId: string, updateUserDto: UpdateUserDto) {
    try {
      const updatedUser = await this.prisma.user.update({
        where: { id: userId },
        data: updateUserDto,
      });
      return {
        statusCode: HttpStatus.OK,
        message: 'User updated successfully',
        data: updatedUser,
      };
    } catch (error: unknown) {
      if ((error as PostgrestError).code === 'P2002') {
        throw new BadRequestException({
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'Error updating user: Duplicate value found',
        });
      }
      throw new NotFoundException({
        statusCode: HttpStatus.NOT_FOUND,
        message: `User with id ${userId} not found`,
      });
    }
  }

  async updateRole(updateUserRoleDto: UpdateUserRoleDto) {
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
        data: updatedUser,
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

  async remove(id: string) {
    try {
      await this.prisma.user.delete({
        where: { id },
      });

      await supabase.auth.admin.deleteUser(id);

      return {
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
