import { Body, Controller, Delete, Get, Param, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from 'src/auth/auth.guard';
import { RequestWithUser } from 'src/auth/interfaces/auth.interface';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto, UpdateCategoryDto } from './dto/categories.dto';

@Controller('categories')
@UseGuards(AuthGuard)
export class CategoriesController {
  constructor(private categoryService: CategoriesService) {}

  @Get()
  async findAll(@Req() req: RequestWithUser) {
    return this.categoryService.findAll(req.user.id);
  }

  @Get('/search')
  async findOne(@Req() req: RequestWithUser, @Query('id') id?: string, @Query('name') name?: string) {
    const userId = req.user.id;
    const query = { id, name };
    return this.categoryService.findOne(userId, query);
  }

  @Post()
  async create(@Req() req: RequestWithUser, @Body() data: CreateCategoryDto) {
    return this.categoryService.create(req.user.id, data);
  }

  @Patch(':id')
  async update(
    @Req() req: RequestWithUser,
    @Param('id') categoryId: string,
    @Body() updateCategoryDto: UpdateCategoryDto,
  ) {
    const userId = req.user.id;
    return this.categoryService.update(userId, categoryId, updateCategoryDto);
  }

  @Delete(':id')
  async remove(@Req() req: RequestWithUser, @Param('id') id: string) {
    return this.categoryService.remove(id, req.user.id);
  }

  @Post('add-defaults')
  async addDefaults(@Req() req: RequestWithUser) {
    return this.categoryService.addDefaultCategories(req.user.id);
  }
}
