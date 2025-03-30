import { BadRequestException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { Invoice, Transaction } from '@prisma/client';
import { PrismaService } from 'prisma/prisma.service';
import { IReceivedData } from 'src/interceptors/response.interceptor';

@Injectable()
export class InvoiceService {
  constructor(private prisma: PrismaService) {}

  private calculateInvoices(transactions: Transaction[]): Map<string, { totalAmount: number }> {
    const invoicesMap = new Map<string, { totalAmount: number }>();

    transactions.forEach((transaction) => {
      const { installments, installmentsValue, amount, cardId, userId, purchaseDate } = transaction;
      const transactionDate = new Date(purchaseDate);

      for (let i = 0; i < installments; i++) {
        const month = transactionDate.getMonth() + 1;
        const year = transactionDate.getFullYear();
        const key = `${cardId}-${userId}-${month}-${year}`;

        const installmentAmount = installmentsValue[i] ?? Number(amount) / installments;

        if (!invoicesMap.has(key)) {
          invoicesMap.set(key, { totalAmount: 0 });
        }

        invoicesMap.get(key)!.totalAmount += Number(installmentAmount);

        transactionDate.setMonth(transactionDate.getMonth() + 1);
      }
    });

    return invoicesMap;
  }

  private async upsertInvoices(invoicesMap: Map<string, { totalAmount: number }>) {
    for (const [key, { totalAmount }] of invoicesMap) {
      const [cardId, userId, month, year] = key.split('-');
      await this.prisma.invoice.upsert({
        where: { cardId_userId_month_year: { cardId, userId, month: Number(month), year: Number(year) } },
        update: { totalAmount },
        create: {
          cardId,
          userId,
          month: Number(month),
          year: Number(year),
          totalAmount,
          dueDate: new Date(Number(year), Number(month) - 1, 5),
        },
      });
    }
  }

  async updateManyInvoices(): Promise<IReceivedData<{ invoicesIds: Invoice['id'][] }>> {
    try {
      const transactions = await this.prisma.transaction.findMany({
        include: { card: true },
      });

      if (!transactions || transactions.length === 0) {
        throw new BadRequestException({
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'No transactions found to update invoices',
        });
      }

      const invoicesMap = this.calculateInvoices(transactions);

      await this.upsertInvoices(invoicesMap);

      const invoiceIdsArray = Array.from(invoicesMap.keys());

      return {
        result: { invoicesIds: invoiceIdsArray },
        statusCode: HttpStatus.CREATED,
        message: 'Invoices updated with success',
        count: invoiceIdsArray.length,
      };
    } catch (error) {
      if (error instanceof BadRequestException || error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException({
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Error updating invoices',
      });
    }
  }

  async FindAll(userId: string): Promise<IReceivedData<Invoice[]>> {
    try {
      const invoicesCount = await this.prisma.invoice.count({
        where: { userId },
        orderBy: { dueDate: 'asc' },
      });

      const invoices = await this.prisma.invoice.findMany({
        where: { userId },
        orderBy: { dueDate: 'asc' },
      });

      if (invoices.length === 0) {
        throw new NotFoundException({
          statusCode: HttpStatus.NOT_FOUND,
          count: 0,
          message: 'No invoices found for this user',
          data: null,
        });
      }
      return {
        statusCode: HttpStatus.OK,
        count: invoicesCount,
        message: 'Invoices retrieved successfully',
        result: invoices,
      };
    } catch (error) {
      if (error instanceof BadRequestException || error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException({
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Failed to retrieve invoices',
      });
    }
  }
}
