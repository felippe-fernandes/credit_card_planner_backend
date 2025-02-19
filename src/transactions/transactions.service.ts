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

      return {
        statusCode: transactions.length ? HttpStatus.OK : HttpStatus.NOT_FOUND,
        message: transactions.length
          ? 'Transactions retrieved successfully'
          : 'No transactions found for this user',
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
            ...query,
            id: query.id ? { equals: query.id } : undefined,
            purchaseName: query.purchaseName
              ? { contains: query.purchaseName, mode: 'insensitive' }
              : undefined,
            description: query.description ? { contains: query.description, mode: 'insensitive' } : undefined,
            installments: query.installments ? { equals: parseInt(query.installments) } : undefined,
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
      if (error instanceof NotFoundException) throw error;
      throw new BadRequestException({
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Failed to retrieve transaction',
      });
    }
  }

  async create(userId: string, createTransactionDto: CreateTransactionDto) {
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
      data: transaction,
    };
  }

  async update(userId: string, transactionId: string, updateTransactionDto: UpdateTransactionDto) {
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
        data: updatedTransaction,
      };
    } catch {
      throw new NotFoundException(`Transaction with id ${transactionId} not found`);
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
