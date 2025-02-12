import { BadRequestException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateCardDto, FindAllCardsDto, FindOneCardDto, UpdateCardDto } from './dto/cards.dto';

@Injectable()
export class CardsService {
  constructor(private prisma: PrismaService) {}

  async findAll(userId: string, filters: FindAllCardsDto) {
    const { name, ...restOfTheFilters } = filters;
    try {
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

  async findOne(userId: string, query: FindOneCardDto) {
    if (!query.id && !query.name) {
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
            id: { equals: query.id },
            name: { contains: query.name, mode: 'insensitive' },
          },
        },
      });

      if (!card) {
        throw new NotFoundException({
          statusCode: HttpStatus.NOT_FOUND,
          message: `Card not found for user with id ${userId}`,
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
        data: card,
      };
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
    const category = await this.prisma.card.findUnique({ where: { id: cardId } });

    if (!category || category.userId !== userId) {
      throw new NotFoundException({
        statusCode: HttpStatus.NOT_FOUND,
        message: `Card with id ${cardId} not found`,
      });
    }

    await this.prisma.category.delete({ where: { id: cardId } });

    return { statusCode: 200, message: 'Card deleted successfully' };
  }
}

// cm728w2lt0000wcb8bklcqg1p
