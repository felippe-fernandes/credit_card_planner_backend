import { BadRequestException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { Transaction } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';
import { PostgrestError } from '@supabase/supabase-js';
import { PrismaService } from 'prisma/prisma.service';
import { IReceivedData } from 'src/interceptors/response.interceptor';
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

  async findAll(userId: string, filters: FindAllTransactionsDto): Promise<IReceivedData<Transaction[]>> {
    const { purchaseName, ...restOfTheFilters } = filters;

    try {
      const transactionCount = await this.prisma.transaction.count({
        where: {
          userId,
          AND: {
            ...restOfTheFilters,
            purchaseName: purchaseName ? { contains: purchaseName, mode: 'insensitive' } : undefined,
            card: restOfTheFilters.card ? { id: restOfTheFilters.card } : undefined,
            dependent: restOfTheFilters.dependent ? { id: restOfTheFilters.dependent } : undefined,
          },
        },
      });

      const transactions = await this.prisma.transaction.findMany({
        where: {
          userId,
          AND: {
            ...restOfTheFilters,
            purchaseName: purchaseName ? { contains: purchaseName, mode: 'insensitive' } : undefined,
            card: restOfTheFilters.card ? { id: restOfTheFilters.card } : undefined,
            dependent: restOfTheFilters.dependent ? { id: restOfTheFilters.dependent } : undefined,
          },
        },
      });

      if (transactions.length === 0) {
        throw new NotFoundException({
          statusCode: HttpStatus.NOT_FOUND,
          message: 'No transactions found for this user',
          count: 0,
          data: null,
        });
      }

      return {
        statusCode: HttpStatus.OK,
        message: 'Transactions retrieved successfully',
        count: transactionCount,
        result: transactions,
      };
    } catch {
      throw new BadRequestException({
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Failed to retrieve transactions',
      });
    }
  }

  async findOne(userId: string, filters: FindOneTransactionDto): Promise<IReceivedData<Transaction>> {
    if (!filters.id && !filters.purchaseName) {
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
            ...filters,
            id: filters.id ? { equals: filters.id } : undefined,
            purchaseName: filters.purchaseName
              ? { contains: filters.purchaseName, mode: 'insensitive' }
              : undefined,
            description: filters.description
              ? { contains: filters.description, mode: 'insensitive' }
              : undefined,
            installments: filters.installments ? { equals: parseInt(filters.installments) } : undefined,
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
        result: transaction,
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

  async create(
    userId: string,
    createTransactionDto: CreateTransactionDto,
  ): Promise<IReceivedData<Transaction>> {
    const { amount, installments, installmentValues, ...rest } = createTransactionDto;

    if (installmentValues.length !== installments) {
      throw new BadRequestException(
        `Número de parcelas (${installments}) não bate com os valores informados (${installmentValues.length})`,
      );
    }

    const totalInstallments = installmentValues.reduce(
      (sum, value) => sum.plus(new Decimal(value)),
      new Decimal(0),
    );

    if (!totalInstallments.equals(new Decimal(amount))) {
      throw new BadRequestException(
        `A soma das parcelas (${totalInstallments.toString()}) deve ser igual ao valor total da compra (${amount})`,
      );
    }

    try {
      const transaction = await this.prisma.transaction.create({
        data: {
          ...rest,
          userId,
          amount: new Decimal(amount),
          installments,
          date: new Date(rest.date),
        },
      });

      await this.updateCardAvailableLimit(transaction.cardId);

      return {
        statusCode: HttpStatus.CREATED,
        message: 'Transaction created successfully',
        result: transaction,
      };
    } catch (error: unknown) {
      if ((error as PostgrestError).code === 'P2002') {
        throw new BadRequestException({
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'Error transaction card: Duplicate value found',
        });
      } else {
        throw new BadRequestException({
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'Error creating transaction',
        });
      }
    }
  }

  async update(
    userId: string,
    transactionId: string,
    updateTransactionDto: UpdateTransactionDto,
  ): Promise<IReceivedData<Transaction>> {
    try {
      const existingTransaction = await this.prisma.transaction.findUnique({
        where: { id: transactionId },
      });

      if (!existingTransaction) {
        throw new NotFoundException(`Transaction with id ${transactionId} not found`);
      }

      const updatedTransaction = await this.prisma.transaction.update({
        where: { id: transactionId },
        data: {
          ...updateTransactionDto,
        },
      });

      await this.updateCardAvailableLimit(updatedTransaction.cardId);

      return {
        statusCode: HttpStatus.OK,
        message: 'Transaction updated successfully',
        count: 1,
        result: updatedTransaction,
      };
    } catch (error: unknown) {
      if ((error as PostgrestError).code === 'P2002') {
        throw new BadRequestException({
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'Error updating transaction: Duplicate value found',
        });
      } else {
        throw new NotFoundException({
          statusCode: HttpStatus.NOT_FOUND,
          message: `Transaction with id ${userId} not found`,
        });
      }
    }
  }

  async remove(userId: string, transactionId: string): Promise<IReceivedData> {
    const existingTransaction = await this.prisma.transaction.findUnique({
      where: { id: transactionId },
    });

    if (!existingTransaction || existingTransaction.userId !== userId) {
      throw new NotFoundException({
        statusCode: HttpStatus.NOT_FOUND,
        message: `Transaction with id ${transactionId} not found`,
      });
    }

    await this.prisma.transaction.delete({ where: { id: transactionId } });

    return {
      result: null,
      statusCode: HttpStatus.OK,
      message: 'Transaction deleted successfully',
    };
  }
}
