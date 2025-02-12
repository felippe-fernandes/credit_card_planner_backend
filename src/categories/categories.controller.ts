import { Body, Controller, Delete, Get, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';
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

  @Post()
  async create(@Req() req: RequestWithUser, @Body() data: CreateCategoryDto) {
    return this.categoryService.create(req.user.id, data);
  }

  @Patch(':id')
  async update(@Req() req: RequestWithUser, @Param('id') id: string, @Body() data: UpdateCategoryDto) {
    return this.categoryService.update(id, req.user.id, data);
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
