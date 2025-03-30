import { BadRequestException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { User } from '@prisma/client';
import { PrismaService } from 'prisma/prisma.service';
import { AuthService } from 'src/auth/auth.service';
import { IReceivedData } from 'src/interceptors/response.interceptor';
import { UpdateUserDto, UpdateUserRoleDto } from './dto/user.dto';

@Injectable()
export class UserService {
  constructor(
    private prisma: PrismaService,
    private authService: AuthService,
  ) {}

  async findAll(): Promise<IReceivedData<User[]>> {
    try {
      const usersCount = await this.prisma.user.count();

      const users = await this.prisma.user.findMany();
      if (users.length === 0) {
        throw new NotFoundException({
          statusCode: HttpStatus.NOT_FOUND,
          count: 0,
          message: 'No users found',
          data: null,
        });
      }
      return {
        statusCode: HttpStatus.OK,
        count: usersCount,
        message: 'Users retrieved successfully',
        result: users,
      };
    } catch (error) {
      if (error instanceof BadRequestException || error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException({
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Failed to retrieve users',
      });
    }
  }

  async updateRole(updateUserRoleDto: UpdateUserRoleDto): Promise<IReceivedData<User>> {
    try {
      const existingUser = await this.prisma.user.findUnique({
        where: { id: updateUserRoleDto.userId },
      });

      if (!existingUser) {
        throw new BadRequestException({
          statusCode: HttpStatus.BAD_REQUEST,
          message: `User with id ${updateUserRoleDto.userId} not found`,
        });
      }

      const updatedUser = await this.prisma.user.update({
        where: { id: updateUserRoleDto.userId },
        data: {
          role: updateUserRoleDto.newRole,
        },
      });
      return {
        statusCode: HttpStatus.OK,
        count: 1,
        message: 'User role updated successfully',
        result: updatedUser,
      };
    } catch (error) {
      if (error instanceof BadRequestException || error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException({
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Error updating user role',
      });
    }
  }

  async remove(userId: string): Promise<IReceivedData<{ userId: User['id'] }>> {
    try {
      const existingUser = await this.prisma.user.findUnique({
        where: { id: userId },
      });

      if (!existingUser) {
        throw new BadRequestException({
          statusCode: HttpStatus.BAD_REQUEST,
          message: `User with id ${userId} not found`,
        });
      }

      if (existingUser.role === 'SUPER_ADMIN') {
        throw new BadRequestException({
          statusCode: HttpStatus.BAD_REQUEST,
          message: `User with id ${userId} is a SUPER_ADMIN, delete are not allowed`,
        });
      }

      await this.prisma.user.delete({
        where: { id: userId },
      });

      return {
        result: { userId },
        statusCode: HttpStatus.OK,
        message: 'User deleted successfully',
        count: 1,
      };
    } catch (error) {
      if (error instanceof BadRequestException || error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException({
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Error deleting user',
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
          count: 0,
          message: `User with id ${id} not found`,
          data: null,
        });
      }
      return {
        statusCode: HttpStatus.OK,
        count: 1,
        message: 'User retrieved successfully',
        result: user,
      };
    } catch (error) {
      if (error instanceof BadRequestException || error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException({
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Failed to retrieve user',
      });
    }
  }

  async update(userId: string, updateUserDto: UpdateUserDto): Promise<IReceivedData<User>> {
    try {
      const existingUser = await this.prisma.user.findUnique({
        where: { id: userId },
      });

      if (!existingUser) {
        throw new BadRequestException({
          statusCode: HttpStatus.BAD_REQUEST,
          message: `User with id ${userId} not found`,
        });
      }

      if (existingUser.role === 'SUPER_ADMIN') {
        throw new BadRequestException({
          statusCode: HttpStatus.BAD_REQUEST,
          message: `User with id ${userId} is a SUPER_ADMIN, updates are not allowed`,
        });
      }

      await this.authService.updateUser(userId, updateUserDto);

      const updatedUser = await this.prisma.user.update({
        where: { id: userId },
        data: updateUserDto,
      });
      return {
        statusCode: HttpStatus.OK,
        count: 1,
        message: 'User updated successfully',
        result: updatedUser,
      };
    } catch (error) {
      if (error instanceof BadRequestException || error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException({
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Error updating user',
      });
    }
  }
}
