import { BadRequestException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { Card } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';
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

      if (cardsCount === 0) {
        console.log('🚀 | cards:', cards);
        throw new NotFoundException({
          statusCode: HttpStatus.NOT_FOUND,
          count: 0,
          message: 'No cards found for this user',
          data: null,
        });
      }
      return {
        statusCode: HttpStatus.OK,
        count: cardsCount,
        message: 'Cards retrieved successfully',
        result: cards,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException({
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Failed to retrieve cards',
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
          availableLimit: createCardDto.limit,
        },
      });

      return {
        statusCode: HttpStatus.CREATED,
        count: 1,
        message: 'Card created successfully',
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

  async findOne(userId: string, filters: FindOneCardDto): Promise<IReceivedData<Card>> {
    if (!filters.id && !filters.name && !filters.bank) {
      throw new BadRequestException({
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Please provide an id, bank or name to search for',
      });
    }

    try {
      const card = await this.prisma.card.findFirst({
        where: {
          userId,
          AND: {
            id: { equals: filters.id },
            name: { contains: filters.name, mode: 'insensitive' },
            bank: { contains: filters.bank, mode: 'insensitive' },
          },
        },
      });

      if (!card) {
        throw new NotFoundException({
          statusCode: HttpStatus.NOT_FOUND,
          count: 0,
          message: `Card not found for user with id ${userId}`,
          data: null,
        });
      }

      return {
        statusCode: HttpStatus.OK,
        count: 1,
        message: 'Card retrieved successfully',
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

  async update(userId: string, cardId: string, updateCardDto: UpdateCardDto): Promise<IReceivedData<Card>> {
    try {
      const existingCard = await this.prisma.card.findUnique({
        where: { id: cardId },
      });

      if (!existingCard) {
        throw new NotFoundException(`Card with id ${cardId} not found`);
      }

      let updatedAvailableLimit = existingCard.availableLimit;

      if (updateCardDto.limit) {
        const newLimit = new Decimal(updateCardDto.limit);

        const difference = newLimit.minus(existingCard.limit);

        updatedAvailableLimit = existingCard.availableLimit.plus(difference);
      }

      const updatedCard = await this.prisma.card.update({
        where: { id: cardId },
        data: {
          ...updateCardDto,
          userId,
          availableLimit: updatedAvailableLimit,
        },
      });

      return {
        statusCode: HttpStatus.OK,
        count: 1,
        message: 'Card updated successfully',
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

    await this.prisma.card.delete({ where: { id: cardId } });

    return { result: { cardId }, statusCode: HttpStatus.OK, message: 'Card deleted successfully', count: 1 };
  }
}
