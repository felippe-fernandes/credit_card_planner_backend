import { BadRequestException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import {
  CreateDependentDto,
  FindAllDependentsDto,
  FindOneDependentDto,
  UpdateDependentDto,
} from './dto/dependents.dto';

@Injectable()
export class DependentsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(userId: string, filters: FindAllDependentsDto) {
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
        return {
          statusCode: HttpStatus.NOT_FOUND,
          message: 'No dependents found for this user',
          count: 0,
          data: [],
        };
      }
      return {
        statusCode: HttpStatus.OK,
        message: 'Dependents retrieved successfully',
        count: dependentsCount,
        data: dependents,
      };
    } catch {
      throw new BadRequestException({
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Failed to retrieve dependents',
      });
    }
  }

  async findOne(userId: string, query: FindOneDependentDto) {
    if (!query.id && !query.name) {
      throw new BadRequestException({
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Please provide an id or name to search for',
      });
    }

    const dependent = await this.prisma.dependent.findUnique({
      where: {
        id: userId,
        AND: {
          id: { equals: query.id },
          name: { contains: query.name, mode: 'insensitive' },
        },
      },
    });

    if (!dependent) {
      throw new NotFoundException({
        statusCode: HttpStatus.NOT_FOUND,
        message: `Dependent not found for user with id ${userId}`,
        count: 0,
        data: null,
      });
    }

    return {
      statusCode: HttpStatus.OK,
      message: 'Dependent retrieved successfully',
      count: 1,
      data: dependent,
    };
  }

  async create(userId: string, createDependentDto: CreateDependentDto) {
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
        message: 'Dependent created successfully',
        count: 1,
        data: dependent,
      };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException({
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Error creating dependent',
      });
    }
  }

  async update(userId: string, id: string, updateDependentDto: UpdateDependentDto) {
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
        message: 'Dependent updated successfully',
        data: updatedDependent,
      };
    } catch {
      throw new NotFoundException({
        statusCode: HttpStatus.NOT_FOUND,
        message: `Dependent with id ${id} not found`,
      });
    }
  }

  async remove(userId: string, id: string) {
    const existingDependent = await this.prisma.dependent.findUnique({
      where: { id },
    });

    if (!existingDependent || existingDependent.userId !== userId) {
      throw new NotFoundException({
        statusCode: HttpStatus.NOT_FOUND,
        message: `Dependent with id ${id} not found`,
      });
    }

    await this.prisma.dependent.delete({ where: { id } });

    return { statusCode: HttpStatus.OK, message: 'Dependent deleted successfully' };
  }
}
