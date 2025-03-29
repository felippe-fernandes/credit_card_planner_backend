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
import { CardsService } from './cards.service';
import { CreateCardDto, FindOneCardDto, ResultCardDto, UpdateCardDto } from './dto/cards.dto';

@Controller('cards')
@ApiTags('Cards')
@ApiBearerAuth()
@UseGuards(AuthGuard)
export class CardsController {
  constructor(private cardService: CardsService) {}

  @Get()
  @ApiOperation({ summary: 'Retrieve all cards for the authenticated user' })
  @ApiOkResponse({ type: ResultCardDto })
  @ApiResponse({ status: 400, description: 'Failed to retrieve cards' })
  @ApiQuery({ name: 'flag', required: false, description: 'Card flag' })
  @ApiQuery({ name: 'bank', required: false, description: 'Bank name' })
  @ApiQuery({ name: 'dueDay', required: false, description: 'Due day' })
  @ApiQuery({ name: 'payDay', required: false, description: 'Pay day' })
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
  @ApiQuery({ name: 'id', required: false, description: 'Card ID', example: '12345' })
  @ApiQuery({ name: 'name', required: false, description: 'Card name', example: 'My Card' })
  @ApiQuery({ name: 'bank', required: false, description: 'Bank name', example: 'Bank Name' })
  async findOne(
    @Req() req: RequestWithUser,
    @Query('id') id?: string,
    @Query('name') name?: string,
    @Query('bank') bank?: string,
  ) {
    const userId = req.user.id;
    const filters: FindOneCardDto = { id, name, bank };
    return this.cardService.findOne(userId, filters);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new card for the authenticated user' })
  @ApiResponse({ status: 201, description: 'Card created successfully' })
  @ApiResponse({ status: 400, description: 'Failed to create card' })
  async create(@Req() req: RequestWithUser, @Body() createCardDto: CreateCardDto) {
    const userId = req.user.id;
    return this.cardService.create(userId, createCardDto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an existing card' })
  @ApiResponse({ status: 200, description: 'Card updated successfully' })
  @ApiResponse({ status: 400, description: 'Failed to update card' })
  @ApiResponse({ status: 404, description: 'Card not found' })
  @ApiParam({ name: 'id', required: true, description: 'Card ID', example: '12345' })
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
  @ApiParam({ name: 'id', required: true, description: 'Card ID', example: '12345' })
  async remove(@Req() req: RequestWithUser, @Param('id') cardId: string) {
    const userId = req.user.id;
    return this.cardService.remove(userId, cardId);
  }
}
