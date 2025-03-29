import { Body, Controller, Delete, Get, Param, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from 'src/auth/auth.guard';
import { RequestWithUser } from 'src/auth/interfaces/auth.interface';
import { CardsService } from './cards.service';
import { CreateCardDto, UpdateCardDto } from './dto/cards.dto';

@ApiTags('Cards')
@ApiBearerAuth()
@Controller('cards')
@UseGuards(AuthGuard)
export class CardsController {
  constructor(private cardService: CardsService) {}

  @Get()
  @ApiOperation({ summary: 'Retrieve all cards for the authenticated user' })
  @ApiResponse({ status: 200, description: 'Cards retrieved successfully' })
  @ApiResponse({ status: 400, description: 'Failed to retrieve cards' })
  @ApiQuery({ name: 'flag', required: false, description: 'Card flag' })
  @ApiQuery({ name: 'bank', required: false, description: 'Card bank' })
  @ApiQuery({ name: 'dueDay', required: false, description: 'Card due day' })
  @ApiQuery({ name: 'payDay', required: false, description: 'Card pay day' })
  @ApiQuery({ name: 'name', required: false, description: 'Card name' })
  async findAll(
    @Req() req: RequestWithUser,
    @Query('flag') flag?: string,
    @Query('bank') bank?: string,
    @Query('dueDay') dueDay?: string,
    @Query('payDay') payDay?: string,
    @Query('name') name?: string,
  ) {
    const userId = req.user.id;
    const dueDayNumber = dueDay ? parseInt(dueDay, 10) : undefined;
    const payDayNumber = payDay ? parseInt(payDay, 10) : undefined;
    const filters = { flag, bank, dueDay: dueDayNumber, payDay: payDayNumber, name };
    return this.cardService.findAll(userId, filters);
  }

  @Get('/search')
  @ApiOperation({ summary: 'Retrieve a single card based on id or name. At least one parameter is required' })
  @ApiResponse({ status: 200, description: 'Card retrieved successfully' })
  @ApiResponse({ status: 400, description: 'Please provide an id or name to search for' })
  @ApiResponse({ status: 404, description: 'Card not found' })
  @ApiQuery({ name: 'id', required: false, description: 'Card ID' })
  @ApiQuery({ name: 'name', required: false, description: 'Card name' })
  async findOne(@Req() req: RequestWithUser, @Query('id') id?: string, @Query('name') name?: string) {
    const userId = req.user.id;
    const filters = { id, name };
    return this.cardService.findOne(userId, filters);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new card for the authenticated user' })
  @ApiResponse({ status: 201, description: 'Card created successfully' })
  @ApiResponse({ status: 400, description: 'Failed to create card' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string', example: 'My Card' },
        bank: { type: 'string', example: 'Bank Name' },
        flag: { type: 'string', example: 'Visa' },
        limit: { type: 'number', example: 1000.0 },
        dueDay: { type: 'number', example: 15 },
        payDay: { type: 'number', example: 30 },
      },
    },
  })
  async create(@Req() req: RequestWithUser, @Body() createCardDto: CreateCardDto) {
    const userId = req.user.id;
    return this.cardService.create(userId, createCardDto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an existing card' })
  @ApiResponse({ status: 200, description: 'Card updated successfully' })
  @ApiResponse({ status: 400, description: 'Failed to update card' })
  @ApiResponse({ status: 404, description: 'Card not found' })
  @ApiQuery({ name: 'id', required: true, description: 'Card ID' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string', example: 'Updated Card Name' },
        bank: { type: 'string', example: 'Updated Bank Name' },
        flag: { type: 'string', example: 'MasterCard' },
        limit: { type: 'number', example: 1500.0 },
        dueDay: { type: 'number', example: 20 },
        payDay: { type: 'number', example: 25 },
      },
    },
  })
  async update(
    @Req() req: RequestWithUser,
    @Param('id') cardId: string,
    @Body() updateCardDto: UpdateCardDto,
  ) {
    const userId = req.user.id;
    return this.cardService.update(userId, cardId, updateCardDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a card' })
  @ApiResponse({ status: 200, description: 'Card deleted successfully' })
  @ApiResponse({ status: 404, description: 'Card not found' })
  @ApiQuery({ name: 'id', required: true, description: 'Card ID' })
  async remove(@Req() req: RequestWithUser, @Param('id') cardId: string) {
    const userId = req.user.id;
    return this.cardService.remove(userId, cardId);
  }
}
