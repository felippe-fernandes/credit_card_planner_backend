import { Injectable } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';

@Injectable()
export class InvoiceService {
  constructor(private prisma: PrismaService) {}

  async updateInvoices() {
    const transactions = await this.prisma.transaction.findMany({
      include: { card: true },
    });

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

    return { message: 'Faturas atualizadas!' };
  }

  async getInvoices(userId: string) {
    return this.prisma.invoice.findMany({
      where: { userId },
      orderBy: { dueDate: 'asc' },
    });
  }
}
