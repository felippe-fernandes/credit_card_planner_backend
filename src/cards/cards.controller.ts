// src/card/card.controller.ts
import { Body, Controller, Delete, Get, Param, Post, Put, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from 'src/auth/auth.guard';
import { RequestWithUser } from 'src/auth/interfaces/auth.interface';
import { CardsService } from './cards.service';
import { CreateCardDto, UpdateCardDto } from './dto/cards.dto';

@Controller('cards')
@UseGuards(AuthGuard)
export class CardsController {
  constructor(private cardService: CardsService) {}

  @Get()
  async findAll(@Req() req: RequestWithUser) {
    const userId = req.user.id;
    return this.cardService.findAll(userId);
  }

  @Get(':id')
  async findOneById(@Req() req: RequestWithUser, @Param('id') cardId: string) {
    const userId = req.user.id;
    return this.cardService.findOneById(userId, cardId);
  }

  @Get(':name')
  async findOneByName(@Req() req: RequestWithUser, @Param('name') cardName: string) {
    const userId = req.user.id;
    return this.cardService.findOneByName(userId, cardName);
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
