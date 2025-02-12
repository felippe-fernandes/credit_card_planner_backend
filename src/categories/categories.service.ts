import { BadRequestException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { defaultCategories } from 'src/constants/categories';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateCategoryDto, FindOneCategoryDto, UpdateCategoryDto } from './dto/categories.dto';

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

  async findAll(userId: string) {
    try {
      const categories = await this.prisma.category.findMany({
        where: { userId },
      });
      if (categories.length === 0) {
        return {
          statusCode: HttpStatus.NOT_FOUND,
          message: 'No categories found for this user',
          data: [],
        };
      }
      return {
        statusCode: HttpStatus.OK,
        message: 'Categories retrieved successfully',
        data: categories,
      };
    } catch {
      throw new BadRequestException({
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Failed to retrieve categories',
      });
    }
  }

  async findOne(userId: string, query: FindOneCategoryDto) {
    if (!query.id && !query.name) {
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
            id: { equals: query.id },
            name: { contains: query.name, mode: 'insensitive' },
          },
        },
      });
      if (!category) {
        throw new NotFoundException({
          statusCode: HttpStatus.NOT_FOUND,
          message: `Category not found for user ${userId}`,
          data: null,
        });
      }
      return {
        statusCode: HttpStatus.OK,
        message: 'Category retrieved successfully',
        data: category,
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

  async create(userId: string, data: CreateCategoryDto) {
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
        data: category,
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

  async update(userId: string, categoryId: string, updateCategoryDto: UpdateCategoryDto) {
    try {
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
        data: updatedCategory,
      };
    } catch {
      throw new NotFoundException({
        statusCode: HttpStatus.NOT_FOUND,
        message: `Category with id ${categoryId} not found`,
      });
    }
  }

  async remove(categoryId: string, userId: string) {
    const category = await this.prisma.category.findUnique({ where: { id: categoryId } });

    if (!category || category.userId !== userId) {
      throw new NotFoundException({
        statusCode: HttpStatus.NOT_FOUND,
        message: `Category with id ${categoryId} not found`,
      });
    }

    await this.prisma.category.delete({ where: { id: categoryId } });

    return { statusCode: 200, message: 'Category deleted successfully' };
  }
}
