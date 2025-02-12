import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { defaultCategories } from 'src/constants/categories';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateCategoryDto, UpdateCategoryDto } from './dto/categories.dto';

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

    return {
      statusCode: 200,
      message: 'Categorias padrão adicionadas com sucesso!',
    };
  }

  async findAll(userId: string) {
    const categories = await this.prisma.category.findMany({
      where: { userId },
    });

    return {
      statusCode: 200,
      message: 'Categories retrieved successfully',
      data: categories,
    };
  }

  async create(userId: string, data: CreateCategoryDto) {
    try {
      const category = await this.prisma.category.create({
        data: { ...data, userId },
      });

      return {
        statusCode: 201,
        message: 'Category created successfully',
        data: category,
      };
    } catch {
      throw new BadRequestException('Error creating category');
    }
  }

  async update(id: string, userId: string, data: UpdateCategoryDto) {
    const category = await this.prisma.category.findUnique({ where: { id } });

    if (!category || category.userId !== userId) {
      throw new NotFoundException('Category not found');
    }

    const updatedCategory = await this.prisma.category.update({
      where: { id },
      data,
    });

    return {
      statusCode: 200,
      message: 'Category updated successfully',
      data: updatedCategory,
    };
  }

  async remove(id: string, userId: string) {
    const category = await this.prisma.category.findUnique({ where: { id } });

    if (!category || category.userId !== userId) {
      throw new NotFoundException('Category not found');
    }

    await this.prisma.category.delete({ where: { id } });

    return { statusCode: 200, message: 'Category deleted successfully' };
  }
}
