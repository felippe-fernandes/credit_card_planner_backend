import { BadRequestException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, Transaction } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';
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
    // Use transaction to prevent race conditions
    return await this.prisma.$transaction(async (prisma: Prisma.TransactionClient) => {
      const existingCard = await prisma.card.findUnique({
        where: { id: cardId },
      });

      if (!existingCard) {
        throw new NotFoundException(`Card with id ${cardId} not found`);
      }

      const totalUsed = await prisma.transaction.aggregate({
        _sum: { amount: true },
        where: { cardId },
      });

      const totalUsedAmount = totalUsed._sum.amount ?? 0;
      const totalUsedDecimal = new Decimal(totalUsedAmount);

      await prisma.card.update({
        where: { id: cardId },
        data: {
          availableLimit: existingCard.limit.minus(totalUsedDecimal),
        },
      });
    });
  }

  private calculateInstallments(
    amount: Decimal,
    installments: number,
    installmentValues: Decimal[] | undefined,
  ): Decimal[] {
    const calculatedInstallments: Decimal[] = Array(installments)
      .fill(amount.div(installments))
      .map((value, index, array) => {
        if (index === array.length - 1) {
          const previousInstallments = array.slice(0, -1) as Decimal[];
          if (previousInstallments.length === 0) {
            return amount;
          }
          const sumPreviousInstallments = Decimal.sum(...previousInstallments);
          return amount.minus(sumPreviousInstallments);
        }
        return value as Decimal;
      });

    return (installmentValues ?? calculatedInstallments).map((value) => new Decimal(value));
  }

  private validateInstallments(amount: Decimal, installments: Decimal[]): void {
    const totalInstallments = installments.reduce((sum, value) => sum.plus(value), new Decimal(0));

    // Check if sum matches total amount (allow small floating point differences)
    const difference = amount.minus(totalInstallments);
    const tolerance = new Decimal('0.01'); // 1 cent tolerance

    if (difference.abs().greaterThan(tolerance)) {
      throw new BadRequestException(
        `Invalid installment values. Sum (${totalInstallments.toString()}) does not equal total amount (${amount.toString()})`,
      );
    }

    // Validate all values are positive and valid numbers
    if (installments.some((value) => value.lte(0) || value.isNaN())) {
      throw new BadRequestException(
        'Invalid installment values. All values must be positive and valid numbers.',
      );
    }
  }

  async findAll(userId: string, filters: FindAllTransactionsDto): Promise<IReceivedData<Transaction[]>> {
    const { purchaseName, installmentDates, startDate, endDate, ...restOfTheFilters } = filters;

    try {
      // Build date range filter
      const dateFilter: {
        purchaseDate?: {
          gte?: Date;
          lte?: Date;
        };
      } = {};
      if (startDate && endDate) {
        dateFilter.purchaseDate = {
          gte: new Date(startDate),
          lte: new Date(endDate),
        };
      } else if (startDate) {
        dateFilter.purchaseDate = { gte: new Date(startDate) };
      } else if (endDate) {
        dateFilter.purchaseDate = { lte: new Date(endDate) };
      }

      const transactionCount = await this.prisma.transaction.count({
        where: {
          userId,
          AND: {
            ...restOfTheFilters,
            ...dateFilter,
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
            ...dateFilter,
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
      if (error instanceof BadRequestException || error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException({
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Error creating transaction',
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

    const finalInstallmentValues = this.calculateInstallments(
      amountDecimal,
      installments,
      installmentValues && installmentValues.length > 0
        ? installmentValues.map((installmentValue) => new Decimal(installmentValue))
        : undefined,
    );

    this.validateInstallments(amountDecimal, finalInstallmentValues);

    const card = await this.prisma.card.findUnique({ where: { id: cardId } });

    if (!card) {
      throw new BadRequestException(`Card not found`);
    }

    const installmentDates = calculateInstallmentDates(transactionDate, card.payDay, installments);

    const existingTransaction = await this.prisma.transaction.findUnique({
      where: { purchaseName_amount: { purchaseName: rest.purchaseName, amount: amountDecimal } },
    });

    if (existingTransaction) {
      throw new BadRequestException({
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Transaction with the same name and value already exists',
      });
    }

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
      if (error instanceof BadRequestException || error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException({
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Error creating transaction',
      });
    }
  }

  async findOne(userId: string, filters: FindOneTransactionDto): Promise<IReceivedData<Transaction>> {
    if (Object.values(filters).every((value) => value === undefined)) {
      throw new BadRequestException({
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Please provide at least one parameter to search for a transaction',
      });
    }

    try {
      const transaction = await this.prisma.transaction.findFirst({
        where: {
          userId,
          AND: {
            ...filters,
            id: filters.id ? filters.id : undefined,
            purchaseName: filters.purchaseName ? filters.purchaseName : undefined,
            description: filters.description
              ? { contains: filters.description, mode: 'insensitive' }
              : undefined,
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
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException({
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Failed to retrieve transaction',
      });
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

      const newAmountDecimal = new Decimal(updateTransactionDto.amount ?? existingTransaction.amount);
      const amountChanged = !newAmountDecimal.equals(existingTransaction.amount);
      const installmentsChanged =
        updateTransactionDto.installments !== undefined &&
        updateTransactionDto.installments !== existingTransaction.installments;
      const dateChanged =
        updateTransactionDto.purchaseDate !== undefined &&
        new Date(updateTransactionDto.purchaseDate).getTime() !== existingTransaction.purchaseDate.getTime();

      let finalInstallmentValues: Decimal[] = existingTransaction.installmentsValue.map(
        (value) => new Decimal(value),
      );
      let installmentDates = existingTransaction.installmentDates;

      // Recalculate installment values if amount or number of installments changed
      if (amountChanged || installmentsChanged) {
        finalInstallmentValues = this.calculateInstallments(
          newAmountDecimal,
          updateTransactionDto.installments ?? existingTransaction.installments,
          updateTransactionDto.installmentValues && updateTransactionDto.installmentValues.length > 0
            ? updateTransactionDto.installmentValues.map((installmentValue) => new Decimal(installmentValue))
            : undefined,
        );

        this.validateInstallments(newAmountDecimal, finalInstallmentValues);
      }

      // Recalculate installment dates if date, installments, or amount changed
      if (amountChanged || installmentsChanged || dateChanged) {
        const transactionDate = updateTransactionDto.purchaseDate
          ? new Date(updateTransactionDto.purchaseDate)
          : existingTransaction.purchaseDate;
        const card = await this.prisma.card.findUnique({
          where: { id: existingTransaction.cardId },
        });
        if (!card) {
          throw new NotFoundException('Card not found');
        }

        installmentDates = calculateInstallmentDates(
          transactionDate,
          card.payDay,
          updateTransactionDto.installments ?? existingTransaction.installments,
        );
      }

      const updatedTransaction = await this.prisma.transaction.update({
        where: { id: transactionId },
        data: {
          ...updateTransactionDto,
          amount: newAmountDecimal,
          installmentsValue: finalInstallmentValues.map((v) => v.toString()),
          installmentDates,
        },
      });

      await this.updateCardAvailableLimit(updatedTransaction.cardId);

      return {
        statusCode: HttpStatus.OK,
        count: 1,
        message: 'Transaction updated successfully',
        result: updatedTransaction,
      };
    } catch (error) {
      if (error instanceof BadRequestException || error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException({
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Error updating transaction',
      });
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

    const cardId = existingTransaction.cardId;

    await this.prisma.transaction.delete({ where: { id: transactionId } });

    // Update card available limit after deletion
    await this.updateCardAvailableLimit(cardId);

    return {
      result: { transactionId },
      statusCode: HttpStatus.OK,
      message: 'Transaction deleted successfully',
      count: 1,
    };
  }
}
