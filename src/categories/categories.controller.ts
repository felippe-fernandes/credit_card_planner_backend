import { Body, Controller, Delete, Get, Param, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { AuthGuard } from 'src/auth/auth.guard';
import { RequestWithUser } from 'src/auth/interfaces/auth.interface';
import { BaseResponseDto, ResponseNotFoundDto } from 'src/constants';
import { ApiErrorDefaultResponses } from 'src/decorators/api-error-default-response.decorators';
import { CategoriesService } from './categories.service';
import {
  CreateCategoryDto,
  FindOneCategoryDto,
  ResultCreateCategoryDto,
  ResultDeleteCategoryDto,
  ResultFindAllCategoryDto,
  ResultFindOneCategoryDto,
  ResultUpdateCategoryDto,
  UpdateCategoryDto,
} from './dto/categories.dto';

@Controller('categories')
@ApiTags('Categories')
@ApiBearerAuth()
@ApiErrorDefaultResponses()
@UseGuards(AuthGuard)
export class CategoriesController {
  constructor(private categoryService: CategoriesService) {}

  @Get()
  @ApiOperation({
    summary: 'Get all categories',
    description: 'Retrieve all categories for the authenticated user.',
  })
  @ApiOkResponse({ type: ResultFindAllCategoryDto })
  @ApiNotFoundResponse({ type: ResponseNotFoundDto })
  @ApiQuery({ name: 'name', required: false, description: 'Filter by category name' })
  async findAll(@Req() req: RequestWithUser, @Query('name') name?: string) {
    const userId = req.user.id;
    const filters = { name };
    return this.categoryService.findAll(userId, filters);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new category' })
  @ApiOkResponse({ type: ResultCreateCategoryDto })
  async create(@Req() req: RequestWithUser, @Body() data: CreateCategoryDto) {
    return this.categoryService.create(req.user.id, data);
  }

  @Post('add-defaults')
  @ApiOperation({ summary: 'Add default categories for the user' })
  @ApiOkResponse({ type: BaseResponseDto })
  async addDefaults(@Req() req: RequestWithUser) {
    return this.categoryService.addDefaultCategories(req.user.id);
  }

  @Get('/search')
  @ApiOperation({ summary: 'Find a category', description: 'Find a specific category by ID or name.' })
  @ApiOkResponse({ type: ResultFindOneCategoryDto })
  @ApiNotFoundResponse({ type: ResponseNotFoundDto })
  @ApiQuery({ name: 'name', required: false, description: 'Category name' })
  async findOne(@Req() req: RequestWithUser, @Query('name') name?: string) {
    const userId = req.user.id;
    const filters: FindOneCategoryDto = { name };
    return this.categoryService.findOne(userId, filters);
  }

  @Patch(':name')
  @ApiOperation({ summary: 'Update a category' })
  @ApiOkResponse({ type: ResultUpdateCategoryDto })
  @ApiParam({ name: 'id', description: 'Category ID' })
  async update(
    @Req() req: RequestWithUser,
    @Param('name') categoryName: string,
    @Body() updateCategoryDto: UpdateCategoryDto,
  ) {
    const userId = req.user.id;
    return this.categoryService.update(userId, categoryName, updateCategoryDto);
  }

  @Delete(':name')
  @ApiOperation({ summary: 'Delete a category' })
  @ApiOkResponse({ type: ResultDeleteCategoryDto })
  @ApiParam({ name: 'name', description: 'Category name' })
  async remove(@Req() req: RequestWithUser, @Param('name') name: string) {
    return this.categoryService.remove(name, req.user.id);
  }
}
