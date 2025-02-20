import { BadRequestException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { Category } from '@prisma/client';
import { PostgrestError } from '@supabase/supabase-js';
import { PrismaService } from 'prisma/prisma.service';
import { defaultCategories } from 'src/constants/categories';
import { IReceivedData } from 'src/interceptors/response.interceptor';
import {
  CreateCategoryDto,
  FindAllCategoryDto,
  FindOneCategoryDto,
  UpdateCategoryDto,
} from './dto/categories.dto';

@Injectable()
export class CategoriesService {
  constructor(private prisma: PrismaService) {}

  async addDefaultCategories(userId: string) {
    const existingCategories = await this.prisma.category.findMany({
      where: { userId },
    });

    for (const category of defaultCategories) {
      if (!existingCategories.find((c) => c.name === category.name)) {
        await this.prisma.category.create({
          data: { ...category, userId },
        });
      }
    }

    const finalCategories = await this.prisma.category.findMany({
      where: { userId },
    });

    return {
      statusCode: HttpStatus.OK,
      message: 'Default categories added successfully',
      data: finalCategories,
    };
  }

  async findAll(userId: string, filters: FindAllCategoryDto): Promise<IReceivedData<Category[]>> {
    const { name, ...restOfTheFilters } = filters;

    try {
      const categoriesCount = await this.prisma.card.count({
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

      const categories = await this.prisma.category.findMany({
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

      if (categories.length === 0) {
        throw new NotFoundException({
          statusCode: HttpStatus.NOT_FOUND,
          message: 'No categories found for this user',
          count: 0,
          data: null,
        });
      }
      return {
        statusCode: HttpStatus.OK,
        message: 'Categories retrieved successfully',
        count: categoriesCount,
        result: categories,
      };
    } catch {
      throw new BadRequestException({
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Failed to retrieve categories',
      });
    }
  }

  async findOne(userId: string, filters: FindOneCategoryDto): Promise<IReceivedData<Category>> {
    if (!filters.id && !filters.name) {
      throw new BadRequestException({
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Please provide an id or name to search for',
      });
    }

    try {
      const category = await this.prisma.category.findFirst({
        where: {
          userId,
          AND: {
            id: { equals: filters.id },
            name: { contains: filters.name, mode: 'insensitive' },
          },
        },
      });
      if (!category) {
        throw new NotFoundException({
          statusCode: HttpStatus.NOT_FOUND,
          message: `Category not found for user ${userId}`,
          count: 0,
          data: null,
        });
      }
      return {
        statusCode: HttpStatus.OK,
        message: 'Category retrieved successfully',
        count: 1,
        result: category,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException({
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Failed to retrieve category',
      });
    }
  }

  async create(userId: string, data: CreateCategoryDto): Promise<IReceivedData<Category>> {
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

      const existingCategory = await this.prisma.category.findFirst({
        where: { name: CreateCategoryDto.name },
      });

      if (existingCategory) {
        throw new BadRequestException({
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'Category with the same name already exists',
        });
      }

      const category = await this.prisma.category.create({
        data: { ...data, userId },
      });

      return {
        statusCode: HttpStatus.CREATED,
        message: 'Category created successfully',
        count: 1,
        result: category,
      };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException({
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Error creating category',
      });
    }
  }

  async update(
    userId: string,
    categoryId: string,
    updateCategoryDto: UpdateCategoryDto,
  ): Promise<IReceivedData<Category>> {
    try {
      const existingCard = await this.prisma.category.findUnique({
        where: { id: categoryId },
      });

      if (!existingCard) {
        throw new NotFoundException(`Category with id ${categoryId} not found`);
      }

      const updatedCategory = await this.prisma.category.update({
        where: { id: categoryId },
        data: {
          ...updateCategoryDto,
          userId,
        },
      });
      return {
        statusCode: HttpStatus.OK,
        message: 'Card updated successfully',
        count: 1,
        result: updatedCategory,
      };
    } catch (error: unknown) {
      if ((error as PostgrestError).code === 'P2002') {
        throw new BadRequestException({
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'Error updating category: Duplicate value found',
        });
      } else {
        throw new NotFoundException({
          statusCode: HttpStatus.NOT_FOUND,
          message: `Category with id ${userId} not found`,
        });
      }
    }
  }

  async remove(categoryId: string, userId: string): Promise<IReceivedData<{ categoryId: Category['id'] }>> {
    const existingCategory = await this.prisma.category.findUnique({ where: { id: categoryId } });

    if (!existingCategory || existingCategory.userId !== userId) {
      throw new NotFoundException({
        statusCode: HttpStatus.NOT_FOUND,
        message: `Catbom diabomegory with id ${categoryId} not found`,
      });
    }

    await this.prisma.category.delete({ where: { id: categoryId } });

    return { result: { categoryId }, statusCode: 200, message: 'Category deleted successfully' };
  }
}
