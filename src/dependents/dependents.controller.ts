import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { AuthGuard } from 'src/auth/auth.guard';
import { RequestWithUser } from 'src/auth/interfaces/auth.interface';
import { ResultDeleteCardDto } from 'src/cards/dto/cards.dto';
import { ResponseNotFoundDto } from 'src/constants';
import { ApiErrorDefaultResponses } from 'src/decorators/api-error-default-response.decorators';
import { DependentsService } from './dependents.service';
import {
  CreateDependentDto,
  FindAllDependentsDto,
  ResultCreateDependentDto,
  ResultFindAllDependentDto,
  ResultFindOneDependentDto,
  ResultUpdateDependentDto,
  UpdateDependentDto,
} from './dto/dependents.dto';

@Controller('dependents')
@ApiTags('Dependents')
@ApiBearerAuth()
@ApiErrorDefaultResponses()
@UseGuards(AuthGuard)
export class DependentsController {
  constructor(private readonly dependentsService: DependentsService) {}

  @Get()
  @ApiOperation({ summary: 'Retrieve all dependents for a authenticated user' })
  @ApiQuery({ name: 'name', required: false, description: 'Filter dependents by name' })
  @ApiQuery({ name: 'id', required: false, description: 'Filter dependents by ID' })
  @ApiOkResponse({ type: ResultFindAllDependentDto })
  @ApiNotFoundResponse({ type: ResponseNotFoundDto })
  findAll(@Req() req: RequestWithUser, @Query('id') dependentId?: string, @Query('name') name?: string) {
    const filters: FindAllDependentsDto = {
      dependentId,
      name,
    };
    const userId = req.user.id;
    return this.dependentsService.findAll(userId, filters);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new dependent for the authenticated user' })
  @ApiCreatedResponse({ type: ResultCreateDependentDto })
  create(@Req() req: RequestWithUser, @Body() createDependentDto: CreateDependentDto) {
    const userId = req.user.id;
    return this.dependentsService.create(userId, createDependentDto);
  }

  @Get('/search')
  @ApiOperation({ summary: 'Retrieve a specific dependent by ID or name for the authenticated user' })
  @ApiOkResponse({ type: ResultFindOneDependentDto })
  @ApiNotFoundResponse({ type: ResponseNotFoundDto })
  @ApiQuery({ name: 'id', required: false, description: 'Dependent ID' })
  @ApiQuery({ name: 'name', required: false, description: 'Dependent name' })
  findOne(@Req() req: RequestWithUser, @Query('id') id?: string, @Query('name') name?: string) {
    const userId = req.user.id;
    const filters = { id, name };
    return this.dependentsService.findOne(userId, filters);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a dependent for the authenticated user' })
  @ApiOkResponse({ type: ResultUpdateDependentDto })
  @ApiParam({ name: 'id', description: 'Dependent ID' })
  update(
    @Req() req: RequestWithUser,
    @Param('id') id: string,
    @Body() updateDependentDto: UpdateDependentDto,
  ) {
    const userId = req.user.id;
    return this.dependentsService.update(userId, id, updateDependentDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a dependent for the authenticated user' })
  @ApiParam({ name: 'id', description: 'Dependent ID' })
  @ApiOkResponse({ type: ResultDeleteCardDto })
  remove(@Req() req: RequestWithUser, @Param('id') id: string) {
    const userId = req.user.id;
    if (userId === id) {
      throw new BadRequestException({
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'User ID cannot be the same as the dependent ID',
      });
    }
    return this.dependentsService.remove(userId, id);
  }
}
