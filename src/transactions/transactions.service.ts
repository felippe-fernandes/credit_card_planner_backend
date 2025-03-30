import { BadRequestException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { Transaction } from '@prisma/client';
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

  private calculateInstallments(
    amount: Decimal,
    installments: number,
    installmentValues: Decimal[] | undefined,
  ): Decimal[] {
    const calculatedInstallments: Decimal[] = Array(installments)
      .fill(amount.div(installments))
      .map((value, index, array) => {
        if (index === array.length - 1) {
          const previousInstallments = array.slice(0, -1);
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

    if (installments.length !== totalInstallments.toNumber()) {
      const difference = amount.minus(totalInstallments);
      installments[installments.length - 1] = installments[installments.length - 1].plus(difference);
    }

    if (
      installments.some((value) => value.lte(0) || value.isNaN()) ||
      !installments.reduce((sum, value) => sum.plus(value), new Decimal(0)).equals(amount)
    ) {
      throw new BadRequestException(
        `Invalid installment values. Ensure all values are positive, valid numbers, and their sum equals the total amount (${amount.toString()})`,
      );
    }
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

      // Se o 'amount' foi alterado, precisamos recalcular 'installmentValues' e 'installmentDates'
      let finalInstallmentValues: Decimal[] = existingTransaction.installmentsValue.map(
        (value) => new Decimal(value),
      );
      let installmentDates = existingTransaction.installmentDates;

      if (amountChanged) {
        // Calcular os novos valores das parcelas
        finalInstallmentValues = this.calculateInstallments(
          newAmountDecimal,
          updateTransactionDto.installments ?? existingTransaction.installments,
          updateTransactionDto.installmentValues && updateTransactionDto.installmentValues.length > 0
            ? updateTransactionDto.installmentValues.map((installmentValue) => new Decimal(installmentValue))
            : undefined,
        );

        this.validateInstallments(newAmountDecimal, finalInstallmentValues);

        const transactionDate = updateTransactionDto.purchaseDate
          ? new Date(updateTransactionDto.purchaseDate)
          : new Date();
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

    await this.prisma.transaction.delete({ where: { id: transactionId } });

    return {
      result: { transactionId },
      statusCode: HttpStatus.OK,
      message: 'Transaction deleted successfully',
      count: 1,
    };
  }
}
