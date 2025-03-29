import { Body, Controller, Delete, Get, Param, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AuthGuard } from 'src/auth/auth.guard';
import { RequestWithUser } from 'src/auth/interfaces/auth.interface';
import { ReceivedDataDto } from 'src/constants';
import { DependentsService } from './dependents.service';
import { CreateDependentDto, FindAllDependentsDto, UpdateDependentDto } from './dto/dependents.dto';

@Controller('dependents')
@ApiTags('Dependents')
@ApiBearerAuth()
@UseGuards(AuthGuard)
export class DependentsController {
  constructor(private readonly dependentsService: DependentsService) {}

  @Get()
  @ApiOperation({ summary: 'Retrieve all dependents for a user' })
  @ApiQuery({ name: 'name', required: false, description: 'Filter dependents by name', example: 'John' })
  @ApiQuery({ name: 'id', required: false, description: 'Filter dependents by ID', example: '12345' })
  @ApiOkResponse({ type: ReceivedDataDto })
  @ApiResponse({ status: 404, description: 'No dependents found' })
  findAll(@Req() req: RequestWithUser, @Query('id') dependentId?: string, @Query('name') name?: string) {
    const filters: FindAllDependentsDto = {
      dependentId,
      name,
    };
    const userId = req.user.id;
    return this.dependentsService.findAll(userId, filters);
  }

  @Get('/search')
  @ApiOperation({ summary: 'Retrieve a specific dependent by ID or name' })
  @ApiQuery({ name: 'id', required: false, description: 'Dependent ID', example: '12345' })
  @ApiQuery({ name: 'name', required: false, description: 'Dependent name', example: 'John Doe' })
  @ApiResponse({ status: 200, description: 'Dependent retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Dependent not found' })
  findOne(@Req() req: RequestWithUser, @Query('id') id?: string, @Query('name') name?: string) {
    const userId = req.user.id;
    const filters = { id, name };
    return this.dependentsService.findOne(userId, filters);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new dependent' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string', example: 'John Doe' },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'Dependent created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  create(@Req() req: RequestWithUser, @Body() createDependentDto: CreateDependentDto) {
    const userId = req.user.id;
    return this.dependentsService.create(userId, createDependentDto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a dependent' })
  @ApiParam({ name: 'id', description: 'Dependent ID', example: '12345' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string', example: 'John Doe' },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Dependent updated successfully' })
  @ApiResponse({ status: 404, description: 'Dependent not found' })
  update(
    @Req() req: RequestWithUser,
    @Param('id') id: string,
    @Body() updateDependentDto: UpdateDependentDto,
  ) {
    const userId = req.user.id;
    return this.dependentsService.update(userId, id, updateDependentDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a dependent' })
  @ApiParam({ name: 'id', description: 'Dependent ID', example: '12345' })
  @ApiResponse({ status: 200, description: 'Dependent deleted successfully' })
  @ApiResponse({ status: 404, description: 'Dependent not found' })
  remove(@Req() req: RequestWithUser, @Param('id') id: string) {
    const userId = req.user.id;
    return this.dependentsService.remove(userId, id);
  }
}
