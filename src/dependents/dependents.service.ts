import { BadRequestException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { Dependent } from '@prisma/client';
import { PostgrestError } from '@supabase/supabase-js';
import { PrismaService } from 'prisma/prisma.service';
import { IReceivedData } from 'src/interceptors/response.interceptor';
import {
  CreateDependentDto,
  FindAllDependentsDto,
  FindOneDependentDto,
  UpdateDependentDto,
} from './dto/dependents.dto';

@Injectable()
export class DependentsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(userId: string, filters: FindAllDependentsDto): Promise<IReceivedData<Dependent[]>> {
    try {
      const { name, ...restOfTheFilters } = filters;
      const dependentsCount = await this.prisma.dependent.count({
        where: {
          userId,
          AND: {
            ...restOfTheFilters,
            name: {
              contains: name,
              mode: 'insensitive',
            },
          },
        },
      });

      const dependents = await this.prisma.dependent.findMany({
        where: {
          userId,
          AND: {
            ...restOfTheFilters,
            name: {
              contains: name,
              mode: 'insensitive',
            },
          },
        },
      });

      if (dependents.length === 0) {
        throw new NotFoundException({
          statusCode: HttpStatus.NOT_FOUND,
          count: 0,
          message: 'No dependents found for this user',
          data: null,
        });
      }
      return {
        statusCode: HttpStatus.OK,
        count: dependentsCount,
        message: 'Dependents retrieved successfully',
        result: dependents,
      };
    } catch {
      throw new BadRequestException({
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Failed to retrieve dependents',
      });
    }
  }

  async findOne(userId: string, filters: FindOneDependentDto): Promise<IReceivedData<Dependent>> {
    if (!filters.id && !filters.name) {
      throw new BadRequestException({
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Please provide an id or name to search for',
      });
    }

    try {
      const dependent = await this.prisma.dependent.findUnique({
        where: {
          id: userId,
          AND: {
            id: { equals: filters.id },
            name: { contains: filters.name, mode: 'insensitive' },
          },
        },
      });

      if (!dependent) {
        throw new NotFoundException({
          statusCode: HttpStatus.NOT_FOUND,
          count: 0,
          message: `Dependent not found for user with id ${userId}`,
          data: null,
        });
      }

      return {
        statusCode: HttpStatus.OK,
        count: 1,
        message: 'Dependent retrieved successfully',
        result: dependent,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException({
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Failed to retrieve dependent',
      });
    }
  }

  async create(userId: string, createDependentDto: CreateDependentDto): Promise<IReceivedData<Dependent>> {
    try {
      const userExists = await this.prisma.user.findUnique({
        where: { id: userId },
      });

      if (!userExists) {
        throw new BadRequestException({
          statusCode: HttpStatus.BAD_REQUEST,
          message: `User with id ${userId} not found`,
        });
      }

      const existingDependent = await this.prisma.dependent.findFirst({
        where: { name: createDependentDto.name },
      });

      if (existingDependent) {
        throw new BadRequestException({
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'Dependent with the same name already exists',
        });
      }

      const dependent = await this.prisma.dependent.create({
        data: {
          ...createDependentDto,
          userId,
        },
      });

      return {
        statusCode: HttpStatus.CREATED,
        count: 1,
        message: 'Dependent created successfully',
        result: dependent,
      };
    } catch (error) {
      if ((error as PostgrestError).code === 'P2002') {
        throw new BadRequestException({
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'Error creating dependent: Duplicate value found',
        });
      } else {
        throw new BadRequestException({
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'Error creating dependent',
        });
      }
    }
  }

  async update(
    userId: string,
    id: string,
    updateDependentDto: UpdateDependentDto,
  ): Promise<IReceivedData<Dependent>> {
    try {
      const existingDependent = await this.prisma.dependent.findUnique({
        where: { id },
      });

      if (!existingDependent) {
        throw new NotFoundException(`Dependent with id ${id} not found`);
      }

      const updatedDependent = await this.prisma.dependent.update({
        where: { id },
        data: { ...updateDependentDto, userId },
      });

      return {
        statusCode: 200,
        count: 1,
        message: 'Dependent updated successfully',
        result: updatedDependent,
      };
    } catch (error: unknown) {
      if ((error as PostgrestError).code === 'P2002') {
        throw new BadRequestException({
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'Error updating dependent: Duplicate value found',
        });
      } else {
        throw new NotFoundException({
          statusCode: HttpStatus.NOT_FOUND,
          message: `Dependent with id ${userId} not found`,
        });
      }
    }
  }

  async remove(
    userId: string,
    dependentId: string,
  ): Promise<IReceivedData<{ dependentId: Dependent['id'] }>> {
    const existingDependent = await this.prisma.dependent.findUnique({
      where: { id: dependentId },
    });

    if (!existingDependent || existingDependent.userId !== userId) {
      throw new NotFoundException({
        statusCode: HttpStatus.NOT_FOUND,
        message: `Dependent with id ${dependentId} not found`,
      });
    }

    await this.prisma.dependent.delete({ where: { id: dependentId } });

    return { result: { dependentId }, statusCode: HttpStatus.OK, message: 'Dependent deleted successfully' };
  }
}
