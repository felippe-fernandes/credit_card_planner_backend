import { BadRequestException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { Card } from '@prisma/client';
import { PostgrestError } from '@supabase/supabase-js';
import { PrismaService } from 'prisma/prisma.service';
import { IReceivedData } from 'src/interceptors/response.interceptor';
import { CreateCardDto, FindAllCardsDto, FindOneCardDto, UpdateCardDto } from './dto/cards.dto';

@Injectable()
export class CardsService {
  constructor(private prisma: PrismaService) {}

  async findAll(userId: string, filters: FindAllCardsDto): Promise<IReceivedData<Card[]>> {
    const { name, ...restOfTheFilters } = filters;

    try {
      const cardsCount = await this.prisma.card.count({
        where: {
          userId,
          AND: {
            ...restOfTheFilters,
            name: {
              contains: name,
              mode: 'insensitive',
            },
          },
        },
      });

      const cards = await this.prisma.card.findMany({
        where: {
          userId,
          AND: {
            ...restOfTheFilters,
            name: {
              contains: name,
              mode: 'insensitive',
            },
          },
        },
      });

      if (cards.length === 0) {
        throw new NotFoundException({
          statusCode: HttpStatus.NOT_FOUND,
          message: 'No cards found for this user',
          count: 0,
          data: null,
        });
      }
      return {
        statusCode: HttpStatus.OK,
        message: 'Cards retrieved successfully',
        count: cardsCount,
        result: cards,
      };
    } catch {
      throw new BadRequestException({
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Failed to retrieve cards',
      });
    }
  }

  async findOne(userId: string, filters: FindOneCardDto): Promise<IReceivedData<Card>> {
    if (!filters.id && !filters.name) {
      throw new BadRequestException({
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Please provide an id or name to search for',
      });
    }

    try {
      const card = await this.prisma.card.findFirst({
        where: {
          userId,
          AND: {
            id: { equals: filters.id },
            name: { contains: filters.name, mode: 'insensitive' },
          },
        },
      });

      if (!card) {
        throw new NotFoundException({
          statusCode: HttpStatus.NOT_FOUND,
          message: `Card not found for user with id ${userId}`,
          count: 0,
          data: null,
        });
      }

      return {
        statusCode: HttpStatus.OK,
        message: 'Card retrieved successfully',
        count: 1,
        result: card,
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

  async create(userId: string, createCardDto: CreateCardDto): Promise<IReceivedData<Card>> {
    try {
      const userExists = await this.prisma.user.findUnique({
        where: { id: userId },
      });

      if (!userExists) {
        throw new BadRequestException({
          statusCode: HttpStatus.BAD_REQUEST,
          message: `User with id ${userId} not found`,
        });
      }

      const existingCard = await this.prisma.card.findFirst({
        where: { name: createCardDto.name },
      });

      if (existingCard) {
        throw new BadRequestException({
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'Card with the same name already exists',
        });
      }

      const card = await this.prisma.card.create({
        data: {
          ...createCardDto,
          userId,
        },
      });

      return {
        statusCode: HttpStatus.CREATED,
        message: 'Card created successfully',
        count: 1,
        result: card,
      };
    } catch (error: unknown) {
      if ((error as PostgrestError).code === 'P2002') {
        throw new BadRequestException({
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'Error creating card: Duplicate value found',
        });
      } else {
        throw new BadRequestException({
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'Error creating card',
        });
      }
    }
  }

  async update(userId: string, cardId: string, updateCardDto: UpdateCardDto): Promise<IReceivedData<Card>> {
    try {
      const existingCard = await this.prisma.card.findUnique({
        where: { id: cardId },
      });

      if (!existingCard) {
        throw new NotFoundException(`Card with id ${cardId} not found`);
      }

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
        count: 1,
        result: updatedCard,
      };
    } catch (error: unknown) {
      if ((error as PostgrestError).code === 'P2002') {
        throw new BadRequestException({
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'Error updating card: Duplicate value found',
        });
      } else {
        throw new NotFoundException({
          statusCode: HttpStatus.NOT_FOUND,
          message: `Card with id ${userId} not found`,
        });
      }
    }
  }

  async remove(userId: string, cardId: string): Promise<IReceivedData<{ cardId: Card['id'] }>> {
    const existingCard = await this.prisma.card.findUnique({ where: { id: cardId } });

    if (!existingCard || existingCard.userId !== userId) {
      throw new NotFoundException({
        statusCode: HttpStatus.NOT_FOUND,
        message: `Card with id ${cardId} not found`,
      });
    }

    await this.prisma.category.delete({ where: { id: cardId } });

    return { result: { cardId }, statusCode: HttpStatus.OK, message: 'Card deleted successfully' };
  }
}
