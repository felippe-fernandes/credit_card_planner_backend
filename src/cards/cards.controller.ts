import { Body, Controller, Delete, Get, Param, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';
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
import { SortOrder } from 'src/common/dto/pagination.dto';
import { ResponseNotFoundDto } from 'src/constants';
import { ApiErrorDefaultResponses } from 'src/decorators/api-error-default-response.decorators';
import { CardsService } from './cards.service';
import {
  CreateCardDto,
  FindOneCardDto,
  ResultCreateCardDto,
  ResultDeleteCardDto,
  ResultFindAllCardDto,
  ResultFindOneCardDto,
  ResultUpdateCardDto,
  UpdateCardDto,
} from './dto/cards.dto';

@Controller('cards')
@ApiTags('Cards')
@ApiBearerAuth()
@ApiErrorDefaultResponses()
@UseGuards(AuthGuard)
export class CardsController {
  constructor(private cardService: CardsService) {}

  @Get()
  @ApiOperation({ summary: 'Retrieve all cards for the authenticated user', operationId: 'getAllCards' })
  @ApiOkResponse({ type: ResultFindAllCardDto })
  @ApiNotFoundResponse({ type: ResponseNotFoundDto })
  @ApiQuery({ name: 'flag', required: false, description: 'Card flag' })
  @ApiQuery({ name: 'bank', required: false, description: 'Bank name' })
  @ApiQuery({ name: 'dueDay', required: false, description: 'Due day' })
  @ApiQuery({ name: 'payDay', required: false, description: 'Pay day' })
  @ApiQuery({ name: 'name', required: false, description: 'Card name' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number (default: 1)' })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Items per page (default: 10, max: 100)',
  })
  @ApiQuery({ name: 'sortBy', required: false, description: 'Field to sort by (default: createdAt)' })
  @ApiQuery({
    name: 'sortOrder',
    required: false,
    enum: ['asc', 'desc'],
    description: 'Sort order (default: desc)',
  })
  async getAllCards(
    @Req() req: RequestWithUser,
    @Query('flag') flag?: string,
    @Query('bank') bank?: string,
    @Query('dueDay') dueDay?: string,
    @Query('payDay') payDay?: string,
    @Query('name') name?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('sortBy') sortBy?: string,
    @Query('sortOrder') sortOrder?: 'asc' | 'desc',
  ) {
    const userId = req.user.id;
    const dueDayNumber = dueDay ? parseInt(dueDay, 10) : undefined;
    const payDayNumber = payDay ? parseInt(payDay, 10) : undefined;
    const pageNumber = page ? parseInt(page, 10) : 1;
    const limitNumber = limit ? parseInt(limit, 10) : 10;
    const filters = {
      flag,
      bank,
      dueDay: dueDayNumber,
      payDay: payDayNumber,
      name,
      page: pageNumber,
      limit: limitNumber,
      sortBy,
      sortOrder: sortOrder as SortOrder,
    };
    return this.cardService.findAll(userId, filters);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new card for the authenticated user', operationId: 'createCard' })
  @ApiCreatedResponse({ type: ResultCreateCardDto })
  async createCard(@Req() req: RequestWithUser, @Body() createCardDto: CreateCardDto) {
    const userId = req.user.id;
    return this.cardService.create(userId, createCardDto);
  }

  @Get('/search')
  @ApiOperation({
    summary: 'Retrieve a single card based on id or name. At least one parameter is required',
    operationId: 'findCard',
  })
  @ApiOkResponse({ type: ResultFindOneCardDto })
  @ApiNotFoundResponse({ type: ResponseNotFoundDto })
  @ApiQuery({ name: 'id', required: false, description: 'Card ID' })
  @ApiQuery({ name: 'name', required: false, description: 'Card name' })
  @ApiQuery({ name: 'bank', required: false, description: 'Bank name' })
  async findCard(
    @Req() req: RequestWithUser,
    @Query('id') id?: string,
    @Query('name') name?: string,
    @Query('bank') bank?: string,
  ) {
    const userId = req.user.id;
    const filters: FindOneCardDto = { id, name, bank };
    return this.cardService.findOne(userId, filters);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an existing card', operationId: 'updateCard' })
  @ApiOkResponse({ type: ResultUpdateCardDto })
  @ApiParam({ name: 'id', required: true, description: 'Card ID' })
  async updateCard(
    @Req() req: RequestWithUser,
    @Param('id') cardId: string,
    @Body() updateCardDto: UpdateCardDto,
  ) {
    const userId = req.user.id;
    return this.cardService.update(userId, cardId, updateCardDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a card', operationId: 'deleteCard' })
  @ApiOkResponse({ type: ResultDeleteCardDto })
  @ApiParam({ name: 'id', required: true, description: 'Card ID' })
  async deleteCard(@Req() req: RequestWithUser, @Param('id') cardId: string) {
    const userId = req.user.id;
    return this.cardService.remove(userId, cardId);
  }
}
