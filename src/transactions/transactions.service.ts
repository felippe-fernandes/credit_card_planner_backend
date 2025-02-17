import { BadRequestException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { Decimal } from '@prisma/client/runtime/library';
import { PrismaService } from 'prisma/prisma.service';
import {
  CreateTransactionDto,
  FindAllTransactionsDto,
  FindOneTransactionDto,
  UpdateTransactionDto,
} from './dto/transaction.dto';

@Injectable()
export class TransactionsService {
  constructor(private prisma: PrismaService) {}

  async updateCardAvailableLimit(cardId: string) {
    const totalUsed = await this.prisma.transaction.aggregate({
      _sum: { amount: true },
      where: { cardId },
    });

    const existingCard = await this.prisma.card.findUnique({
      where: { id: cardId },
    });

    if (!existingCard) {
      throw new NotFoundException(`Card with id ${cardId} not found`);
    }

    const totalUsedAmount = totalUsed._sum.amount ?? 0;

    const totalUsedDecimal = new Decimal(totalUsedAmount);

    await this.prisma.card.update({
      where: { id: cardId },
      data: {
        availableLimit: existingCard.limit.minus(totalUsedDecimal),
      },
    });
  }

  async findAll(userId: string, filters: FindAllTransactionsDto) {
    const { purchaseName, ...restOfTheFilters } = filters;

    try {
      const transactionCount = await this.prisma.transaction.count({
        where: {
          userId,
          AND: {
            ...restOfTheFilters,
            purchaseName: {
              contains: purchaseName,
              mode: 'insensitive',
            },
            card: {
              id: restOfTheFilters.card,
            },
            dependent: {
              id: restOfTheFilters.dependent,
            },
          },
        },
      });

      const transactions = await this.prisma.transaction.findMany({
        where: {
          userId,
          AND: {
            ...restOfTheFilters,
            purchaseName: {
              contains: purchaseName,
              mode: 'insensitive',
            },
            card: {
              id: restOfTheFilters.card,
            },
            dependent: {
              id: restOfTheFilters.dependent,
            },
          },
        },
      });

      if (transactions.length === 0) {
        return {
          statusCode: HttpStatus.NOT_FOUND,
          message: 'No transactions found for this user',
          count: 0,
          data: [],
        };
      }

      return {
        statusCode: HttpStatus.OK,
        message: 'Transactions retrieved successfully',
        count: transactionCount,
        data: transactions,
      };
    } catch {
      throw new BadRequestException({
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Failed to retrieve transactions',
      });
    }
  }

  async findOne(userId: string, query: FindOneTransactionDto) {
    if (!query.id && !query.purchaseName) {
      throw new BadRequestException({
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Please provide an id or purchaseName to search for',
      });
    }

    try {
      const transaction = await this.prisma.transaction.findFirst({
        where: {
          userId,
          AND: {
            id: { equals: query.id },
            purchaseName: { contains: query.purchaseName, mode: 'insensitive' },
          },
        },
      });

      if (!transaction) {
        throw new NotFoundException({
          statusCode: HttpStatus.NOT_FOUND,
          message: `Transaction not found for user with id ${userId}`,
          count: 0,
          data: null,
        });
      }

      return {
        statusCode: HttpStatus.OK,
        message: 'Transaction retrieved successfully',
        count: 1,
        data: transaction,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException({
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Failed to retrieve transaction',
      });
    }
  }

  async create(userId: string, createTransactionDto: CreateTransactionDto) {
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

      const cardExists = await this.prisma.card.findUnique({
        where: { id: createTransactionDto.cardId },
      });

      if (!cardExists) {
        throw new BadRequestException({
          statusCode: HttpStatus.BAD_REQUEST,
          message: `Card with id ${createTransactionDto.cardId} not found`,
        });
      }

      if (createTransactionDto.dependentId) {
        const dependentExists = await this.prisma.dependent.findUnique({
          where: { id: createTransactionDto.dependentId },
        });

        if (!dependentExists) {
          throw new BadRequestException({
            statusCode: HttpStatus.BAD_REQUEST,
            message: `Dependent with id ${createTransactionDto.dependentId} not found`,
          });
        }
      }

      const transaction = await this.prisma.transaction.create({
        data: {
          ...createTransactionDto,
          userId,
          date: new Date(createTransactionDto.date),
          dependentId: createTransactionDto.dependentId ?? userId,
        },
      });

      await this.updateCardAvailableLimit(transaction.cardId);

      return {
        statusCode: HttpStatus.CREATED,
        message: 'Transaction created successfully',
        data: transaction,
      };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }

      throw new BadRequestException({
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Error creating transaction',
      });
    }
  }

  async update(userId: string, transactionId: string, updateTransactionDto: UpdateTransactionDto) {
    try {
      const updatedTransaction = await this.prisma.transaction.update({
        where: { id: transactionId },
        data: {
          ...updateTransactionDto,
          userId,
        },
      });

      await this.updateCardAvailableLimit(updatedTransaction.cardId);

      return {
        statusCode: HttpStatus.OK,
        message: 'Transaction updated successfully',
        data: updatedTransaction,
      };
    } catch {
      throw new NotFoundException({
        statusCode: HttpStatus.NOT_FOUND,
        message: `Transaction with id ${transactionId} not found`,
      });
    }
  }

  async remove(userId: string, transactionId: string) {
    const transaction = await this.prisma.transaction.findUnique({
      where: { id: transactionId },
    });

    if (!transaction || transaction.userId !== userId) {
      throw new NotFoundException({
        statusCode: HttpStatus.NOT_FOUND,
        message: `Transaction with id ${transactionId} not found`,
      });
    }

    await this.prisma.transaction.delete({ where: { id: transactionId } });

    return {
      statusCode: HttpStatus.OK,
      message: 'Transaction deleted successfully',
    };
  }
}
