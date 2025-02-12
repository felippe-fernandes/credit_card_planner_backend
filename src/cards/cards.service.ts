// src/card/card.service.ts
import { BadRequestException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateCardDto, UpdateCardDto } from './dto/cards.dto';

@Injectable()
export class CardsService {
  constructor(private prisma: PrismaService) {}

  async findAll(userId: string) {
    try {
      const cards = await this.prisma.card.findMany({
        where: { userId },
      });
      if (cards.length === 0) {
        return {
          statusCode: HttpStatus.NOT_FOUND,
          message: 'No cards found for this user',
          data: [],
        };
      }
      return {
        statusCode: HttpStatus.OK,
        message: 'Cards retrieved successfully',
        data: cards,
      };
    } catch {
      throw new BadRequestException({
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Failed to retrieve cards',
      });
    }
  }

  async findOneById(userId: string, cardId: string) {
    try {
      const card = await this.prisma.card.findUnique({
        where: { id: cardId },
      });
      if (!card) {
        throw new NotFoundException({
          statusCode: HttpStatus.NOT_FOUND,
          message: `Card with id ${cardId} not found for user ${userId}`,
          data: null,
        });
      }
      return {
        statusCode: HttpStatus.OK,
        message: 'Card retrieved successfully',
        data: card,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException({
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Failed to retrieve card',
      });
    }
  }

  async findOneByName(userId: string, cardName: string) {
    try {
      const card = await this.prisma.card.findFirst({
        where: { name: cardName },
      });

      if (!card) {
        throw new NotFoundException({
          statusCode: HttpStatus.NOT_FOUND,
          message: `Card with name ${cardName} not found for user ${userId}`,
          data: null,
        });
      }
      return {
        statusCode: HttpStatus.OK,
        message: 'Card retrieved successfully',
        data: card,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException({
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Failed to retrieve card',
      });
    }
  }

  async create(userId: string, createCardDto: CreateCardDto) {
    try {
      const existingCard = await this.prisma.card.findFirst({
        where: { name: createCardDto.name },
      });

      if (existingCard) {
        throw new BadRequestException({
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'Card with the same name already exists',
        });
      } else {
        const card = await this.prisma.card.create({
          data: {
            ...createCardDto,
            userId,
          },
        });

        return {
          statusCode: HttpStatus.CREATED,
          message: 'Card created successfully',
          data: card,
        };
      }
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException({
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Error creating card',
      });
    }
  }

  async update(userId: string, cardId: string, updateCardDto: UpdateCardDto) {
    try {
      const updatedCard = await this.prisma.card.update({
        where: { id: cardId },
        data: {
          ...updateCardDto,
          userId,
        },
      });
      return {
        statusCode: HttpStatus.OK,
        message: 'Card updated successfully',
        data: updatedCard,
      };
    } catch {
      throw new NotFoundException({
        statusCode: HttpStatus.NOT_FOUND,
        message: `Card with id ${cardId} not found`,
      });
    }
  }

  async remove(userId: string, cardId: string) {
    try {
      await this.prisma.card.delete({
        where: { id: cardId },
      });
      return {
        statusCode: HttpStatus.OK,
        message: 'Card deleted successfully',
      };
    } catch {
      throw new NotFoundException({
        statusCode: HttpStatus.NOT_FOUND,
        message: `Card with id ${cardId} not found`,
      });
    }
  }
}
