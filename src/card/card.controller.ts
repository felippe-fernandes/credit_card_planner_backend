import { Body, Controller, Delete, Get, Param, Post, Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/auth.guard';
import { RequestWithUser } from 'src/auth/interfaces/request-user.interface';
import { CardService } from './card.service';
import { CreateCardDto } from './dto/card.dto';

@Controller('cards')
@UseGuards(JwtAuthGuard)
export class CardController {
  constructor(private readonly cardService: CardService) {}

  @Post()
  create(@Request() req: RequestWithUser, @Body() createCardDto: CreateCardDto) {
    return this.cardService.create(req.user.sub, createCardDto);
  }

  @Get()
  findAll(@Request() req: RequestWithUser) {
    return this.cardService.findAll(req.user.sub);
  }

  @Get(':id')
  findOne(@Request() req: RequestWithUser, @Param('id') id: string) {
    return this.cardService.findOne(id, req.user.sub);
  }

  @Delete(':id')
  remove(@Request() req: RequestWithUser, @Param('id') id: string) {
    return this.cardService.delete(id, req.user.sub);
  }
}
