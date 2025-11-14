import { BadRequestException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { Category } from '@prisma/client';
import { PrismaService } from 'prisma/prisma.service';
import { PaginationHelper } from 'src/common/dto/pagination.dto';
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

  async findAll(userId: string, filters: FindAllCategoryDto): Promise<IReceivedData<Category[]>> {
    const {
      name,
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      ...restOfTheFilters
    } = filters;

    try {
      const whereClause = {
        userId,
        AND: {
          ...restOfTheFilters,
          name: {
            contains: name,
            mode: 'insensitive' as const,
          },
        },
      };

      const categoriesCount = await this.prisma.category.count({
        where: whereClause,
      });

      const skip = PaginationHelper.calculateSkip(page, limit);

      const categories = await this.prisma.category.findMany({
        where: whereClause,
        orderBy: {
          [sortBy]: sortOrder,
        },
        skip,
        take: limit,
      });

      if (categories.length === 0) {
        throw new NotFoundException({
          statusCode: HttpStatus.NOT_FOUND,
          count: 0,
          message: 'No categories found for this user',
          data: null,
        });
      }

      const meta = PaginationHelper.calculateMeta(page, limit, categoriesCount);

      return {
        statusCode: HttpStatus.OK,
        count: categoriesCount,
        message: 'Categories retrieved successfully',
        result: categories,
        meta,
      };
    } catch {
      throw new BadRequestException({
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Failed to retrieve categories',
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
        where: { userId, AND: { name: data.name } },
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
        count: 1,
        message: 'Category created successfully',
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

  async findOne(userId: string, filters: FindOneCategoryDto): Promise<IReceivedData<Category>> {
    if (!filters.name) {
      throw new BadRequestException({
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Please provide an name to search for',
      });
    }

    try {
      const category = await this.prisma.category.findFirst({
        where: {
          userId,
          AND: {
            name: filters.name,
          },
        },
      });
      if (!category) {
        throw new NotFoundException({
          statusCode: HttpStatus.NOT_FOUND,
          count: 0,
          message: `Category not found for user ${userId}`,
          data: null,
        });
      }
      return {
        statusCode: HttpStatus.OK,
        count: 1,
        message: 'Category retrieved successfully',
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

  async update(
    userId: string,
    categoryName: string,
    updateCategoryDto: UpdateCategoryDto,
  ): Promise<IReceivedData<Category>> {
    try {
      const existingCard = await this.prisma.category.findFirst({
        where: { userId, AND: { name: categoryName } },
      });

      if (!existingCard) {
        throw new NotFoundException(`Category with id ${categoryName} not found`);
      }

      const updatedCategory = await this.prisma.category.update({
        where: { name_userId: { name: categoryName, userId } },
        data: {
          ...updateCategoryDto,
          userId,
        },
      });
      return {
        statusCode: HttpStatus.OK,
        count: 1,
        message: 'Card updated successfully',
        result: updatedCategory,
      };
    } catch (error: unknown) {
      if (error instanceof BadRequestException || error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException({
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Error updating category',
      });
    }
  }

  async remove(categoryName: string, userId: string): Promise<IReceivedData<{ category: Category['name'] }>> {
    try {
      const existingCategory = await this.prisma.category.findFirst({
        where: { userId, AND: { name: categoryName } },
      });

      if (!existingCategory || existingCategory.userId !== userId) {
        throw new NotFoundException({
          statusCode: HttpStatus.NOT_FOUND,
          message: `Category with id ${categoryName} not found`,
        });
      }

      await this.prisma.category.delete({
        where: {
          name_userId: { name: categoryName, userId },
        },
      });

      return {
        result: { category: categoryName },
        statusCode: 200,
        message: 'Category deleted successfully',
        count: 1,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException({
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Error deleting category',
      });
    }
  }
}
