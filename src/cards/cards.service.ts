import {
  BadRequestException,
  ForbiddenException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Card } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';
import { PrismaService } from 'prisma/prisma.service';
import { PaginationHelper } from 'src/common/dto/pagination.dto';
import { IReceivedData } from 'src/interceptors/response.interceptor';
import { CreateCardDto, FindAllCardsDto, FindOneCardDto, UpdateCardDto } from './dto/cards.dto';

@Injectable()
export class CardsService {
  constructor(private prisma: PrismaService) {}

  async findAll(userId: string, filters: FindAllCardsDto): Promise<IReceivedData<Card[]>> {
    const {
      name,
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      ...restOfTheFilters
    } = filters;

    try {
      const whereClause = {
        userId,
        AND: {
          ...restOfTheFilters,
          name: {
            contains: name,
            mode: 'insensitive' as const,
          },
        },
      };

      const cardsCount = await this.prisma.card.count({
        where: whereClause,
      });

      const skip = PaginationHelper.calculateSkip(page, limit);

      const cards = await this.prisma.card.findMany({
        where: whereClause,
        orderBy: {
          [sortBy]: sortOrder,
        },
        skip,
        take: limit,
      });

      if (cardsCount === 0) {
        throw new NotFoundException({
          statusCode: HttpStatus.NOT_FOUND,
          count: 0,
          message: 'No cards found for this user',
          data: null,
        });
      }

      const meta = PaginationHelper.calculateMeta(page, limit, cardsCount);

      return {
        statusCode: HttpStatus.OK,
        count: cardsCount,
        message: 'Cards retrieved successfully',
        result: cards,
        meta,
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

      // Check if card name already exists for this user
      const existingCard = await this.prisma.card.findFirst({
        where: {
          name: createCardDto.name,
          userId: userId,
        },
      });

      if (existingCard) {
        throw new BadRequestException({
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'You already have a card with this name',
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
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException({
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Error creating card',
      });
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
            name: { equals: filters.name, mode: 'insensitive' as const },
            bank: { equals: filters.bank, mode: 'insensitive' as const },
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

      // Authorization check: ensure card belongs to user
      if (existingCard.userId !== userId) {
        throw new ForbiddenException({
          statusCode: HttpStatus.FORBIDDEN,
          message: 'You do not have permission to update this card',
        });
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
      if (
        error instanceof BadRequestException ||
        error instanceof NotFoundException ||
        error instanceof ForbiddenException
      ) {
        throw error;
      }
      throw new BadRequestException({
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Error updating card',
      });
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
