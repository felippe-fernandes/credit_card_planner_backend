import { BadRequestException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { Transaction } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';
import { PostgrestError } from '@supabase/supabase-js';
import { PrismaService } from 'prisma/prisma.service';
import { IReceivedData } from 'src/interceptors/response.interceptor';
import { calculateInstallmentDates } from 'src/utils/transactions';
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
    const { purchaseName, installmentDates, ...restOfTheFilters } = filters;

    try {
      const transactionCount = await this.prisma.transaction.count({
        where: {
          userId,
          AND: {
            ...restOfTheFilters,
            purchaseName: purchaseName ? { contains: purchaseName, mode: 'insensitive' } : undefined,
            installmentDates: installmentDates ? { hasSome: installmentDates } : undefined,
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
            installmentDates: installmentDates ? { hasSome: installmentDates } : undefined,
            dependent: restOfTheFilters.dependent ? { id: restOfTheFilters.dependent } : undefined,
          },
        },
        include: {
          card: {
            select: {
              name: true,
            },
          },
          dependent: {
            select: {
              name: true,
            },
          },
        },
      });

      if (transactions.length === 0) {
        throw new NotFoundException({
          statusCode: HttpStatus.NOT_FOUND,
          count: 0,
          message: 'No transactions found for this user',
          data: null,
        });
      }

      return {
        statusCode: HttpStatus.OK,
        count: transactionCount,
        message: 'Transactions retrieved successfully',
        result: transactions,
      };
    } catch (error) {
      console.log('🚀 | error:', error);
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
        include: {
          card: {
            select: {
              name: true,
            },
          },
          dependent: {
            select: {
              name: true,
            },
          },
        },
      });

      if (!transaction) {
        throw new NotFoundException({
          statusCode: HttpStatus.NOT_FOUND,
          count: 0,
          message: `Transaction not found for user with id ${userId}`,
          data: null,
        });
      }

      return {
        statusCode: HttpStatus.OK,
        count: 1,
        message: 'Transaction retrieved successfully',
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
    const { amount, installments, installmentValues, cardId, dependentId, purchaseDate, ...rest } =
      createTransactionDto;

    const amountDecimal = new Decimal(amount);

    const transactionDate = purchaseDate ? new Date(purchaseDate) : new Date();

    const calculatedInstallments: Decimal[] = Array(installments)
      .fill(amountDecimal.div(installments))
      .map((value, index, array) => {
        if (index === array.length - 1) {
          const sumPreviousInstallments = Decimal.sum(...array.slice(0, -1));
          return amountDecimal.minus(sumPreviousInstallments);
        }
        return value as Decimal;
      });

    const finalInstallmentValues: Decimal[] = (installmentValues ?? calculatedInstallments.map((v) => v)).map(
      (value) => new Decimal(value),
    );

    if (finalInstallmentValues.length !== installments) {
      throw new BadRequestException(
        `Number of installments (${installments}) does not match the provided values (${finalInstallmentValues.length})`,
      );
    }

    const totalInstallments = finalInstallmentValues.reduce((sum, value) => sum.plus(value), new Decimal(0));

    if (!totalInstallments.equals(amountDecimal)) {
      throw new BadRequestException(
        `The sum of installments (${totalInstallments.toString()}) must be equal to the total purchase amount (${amountDecimal.toString()})`,
      );
    }

    const card = await this.prisma.card.findUnique({ where: { id: cardId } });

    if (!card) {
      throw new BadRequestException(`Card not found`);
    }

    const installmentDates = calculateInstallmentDates(transactionDate, card.payDay, installments);

    try {
      const transaction = await this.prisma.transaction.create({
        data: {
          ...rest,
          userId,
          cardId,
          dependentId: dependentId ?? userId,
          amount: amountDecimal,
          installments,
          purchaseDate: transactionDate,
          installmentDates,
          installmentsValue: finalInstallmentValues.map((v) => v.toString()),
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
          message: 'Error processing transaction: Duplicate value found',
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
        count: 1,
        message: 'Transaction updated successfully',
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

  async remove(
    userId: string,
    transactionId: string,
  ): Promise<IReceivedData<{ transactionId: Transaction['id'] }>> {
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
      result: { transactionId },
      statusCode: HttpStatus.OK,
      message: 'Transaction deleted successfully',
    };
  }
}
