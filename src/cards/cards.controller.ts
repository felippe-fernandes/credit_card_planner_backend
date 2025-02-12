import { Body, Controller, Delete, Get, Param, Post, Put, Query, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from 'src/auth/auth.guard';
import { RequestWithUser } from 'src/auth/interfaces/auth.interface';
import { CardsService } from './cards.service';
import { CreateCardDto, UpdateCardDto } from './dto/cards.dto';

@Controller('cards')
@UseGuards(AuthGuard)
export class CardsController {
  constructor(private cardService: CardsService) {}

  @Get()
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
  async findOneById(@Req() req: RequestWithUser, @Query('id') id?: string, @Query('name') name?: string) {
    const userId = req.user.id;
    const query = { id, name };
    return this.cardService.findOne(userId, query);
  }

  @Post()
  async create(@Req() req: RequestWithUser, @Body() createCardDto: CreateCardDto) {
    const userId = req.user.id;
    return this.cardService.create(userId, createCardDto);
  }

  @Put(':id')
  async update(
    @Req() req: RequestWithUser,
    @Param('id') cardId: string,
    @Body() updateCardDto: UpdateCardDto,
  ) {
    const userId = req.user.id;
    return this.cardService.update(userId, cardId, updateCardDto);
  }

  @Delete(':id')
  async remove(@Req() req: RequestWithUser, @Param('id') cardId: string) {
    const userId = req.user.id;
    return this.cardService.remove(userId, cardId);
  }
}
