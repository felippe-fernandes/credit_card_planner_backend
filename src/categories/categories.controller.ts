import { Body, Controller, Delete, Get, Param, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AuthGuard } from 'src/auth/auth.guard';
import { RequestWithUser } from 'src/auth/interfaces/auth.interface';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto, UpdateCategoryDto } from './dto/categories.dto';

@Controller('categories')
@ApiTags('Categories')
@ApiBearerAuth()
@UseGuards(AuthGuard)
export class CategoriesController {
  constructor(private categoryService: CategoriesService) {}

  @Get()
  @ApiOperation({
    summary: 'Get all categories',
    description: 'Retrieve all categories for the authenticated user.',
  })
  @ApiQuery({ name: 'id', required: false, description: 'Filter by category ID', example: '123' })
  @ApiQuery({ name: 'name', required: false, description: 'Filter by category name', example: 'Groceries' })
  async findAll(@Req() req: RequestWithUser, @Query('id') id?: string, @Query('name') name?: string) {
    const userId = req.user.id;
    const filters = { id, name };
    return this.categoryService.findAll(userId, filters);
  }

  @Get('/search')
  @ApiOperation({ summary: 'Find a category', description: 'Find a specific category by ID or name.' })
  @ApiQuery({ name: 'id', required: false, description: 'Category ID', example: '123' })
  @ApiQuery({ name: 'name', required: false, description: 'Category name', example: 'Groceries' })
  async findOne(@Req() req: RequestWithUser, @Query('id') id?: string, @Query('name') name?: string) {
    const userId = req.user.id;
    const filters = { id, name };
    return this.categoryService.findOne(userId, filters);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new category' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string', example: 'Groceries' },
        icon: { type: 'string', example: 'shopping-cart' },
        color: { type: 'string', example: '#FF5733' },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'Category created successfully' })
  async create(@Req() req: RequestWithUser, @Body() data: CreateCategoryDto) {
    return this.categoryService.create(req.user.id, data);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a category' })
  @ApiParam({ name: 'id', description: 'Category ID', example: '123' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string', example: 'Groceries' },
        icon: { type: 'string', example: 'shopping-cart' },
        color: { type: 'string', example: '#FF5733' },
      },
    },
  })
  async update(
    @Req() req: RequestWithUser,
    @Param('id') categoryId: string,
    @Body() updateCategoryDto: UpdateCategoryDto,
  ) {
    const userId = req.user.id;
    return this.categoryService.update(userId, categoryId, updateCategoryDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a category' })
  @ApiParam({ name: 'id', description: 'Category ID', example: '123' })
  async remove(@Req() req: RequestWithUser, @Param('id') id: string) {
    return this.categoryService.remove(id, req.user.id);
  }

  @Post('add-defaults')
  @ApiOperation({ summary: 'Add default categories for the user' })
  async addDefaults(@Req() req: RequestWithUser) {
    return this.categoryService.addDefaultCategories(req.user.id);
  }
}
