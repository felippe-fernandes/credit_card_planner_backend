import { Body, Controller, Delete, Get, Param, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from 'src/auth/auth.guard';
import { RequestWithUser } from 'src/auth/interfaces/auth.interface';
import { DependentsService } from './dependents.service';
import { CreateDependentDto, FindAllDependentsDto, UpdateDependentDto } from './dto/dependents.dto';

@Controller('dependents')
@UseGuards(AuthGuard)
export class DependentsController {
  constructor(private readonly dependentsService: DependentsService) {}

  @Get()
  findAll(@Req() req: RequestWithUser, @Query('id') dependentId?: string, @Query('name') name?: string) {
    const filters: FindAllDependentsDto = {
      dependentId,
      name,
    };
    const userId = req.user.id;
    return this.dependentsService.findAll(userId, filters);
  }

  @Get('/search')
  findOne(@Req() req: RequestWithUser, @Query('id') id?: string, @Query('name') name?: string) {
    const userId = req.user.id;
    const filters = { id, name };
    return this.dependentsService.findOne(userId, filters);
  }

  @Post()
  create(@Req() req: RequestWithUser, @Body() createDependentDto: CreateDependentDto) {
    const userId = req.user.id;
    return this.dependentsService.create(userId, createDependentDto);
  }

  @Patch(':id')
  update(
    @Req() req: RequestWithUser,
    @Param('id') id: string,
    @Body() updateDependentDto: UpdateDependentDto,
  ) {
    const userId = req.user.id;
    return this.dependentsService.update(userId, id, updateDependentDto);
  }

  @Delete(':id')
  remove(@Req() req: RequestWithUser, @Param('id') id: string) {
    const userId = req.user.id;
    return this.dependentsService.remove(userId, id);
  }
}
