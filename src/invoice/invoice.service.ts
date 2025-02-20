import { BadRequestException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { Invoice, Transaction } from '@prisma/client';
import { PostgrestError } from '@supabase/supabase-js';
import { PrismaService } from 'prisma/prisma.service';
import { IReceivedData } from 'src/interceptors/response.interceptor';

@Injectable()
export class InvoiceService {
  constructor(private prisma: PrismaService) {}

  private calculateInvoices(transactions: Transaction[]): Map<string, { totalAmount: number }> {
    const invoicesMap = new Map<string, { totalAmount: number }>();

    transactions.forEach((transaction) => {
      const { date, installments, installmentsValue, amount, cardId, userId } = transaction;
      const transactionDate = new Date(date);

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

  async updateManyInvoices(): Promise<IReceivedData> {
    try {
      const transactions = await this.prisma.transaction.findMany({
        include: { card: true },
      });

      const invoicesMap = this.calculateInvoices(transactions);

      await this.upsertInvoices(invoicesMap);

      return {
        statusCode: HttpStatus.CREATED,
        message: 'Invoices updated!',
      };
    } catch (error: unknown) {
      if ((error as PostgrestError).code === 'P2002') {
        throw new BadRequestException({
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'Error updating invoices: Duplicate value found',
        });
      } else {
        throw new NotFoundException({
          statusCode: HttpStatus.NOT_FOUND,
          message: 'Error updating invoices',
        });
      }
    }
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
          message: 'No invoices found for this user',
          count: 0,
          data: null,
        });
      }
      return {
        statusCode: HttpStatus.OK,
        message: 'Invoices retrieved successfully',
        count: invoicesCount,
        result: invoices,
      };
    } catch {
      throw new BadRequestException({
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Failed to retrieve invoices',
      });
    }
  }
}
