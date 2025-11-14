import { BadRequestException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { Invoice, InvoiceStatus, Transaction } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';
import { addMonths } from 'date-fns';
import { PrismaService } from 'prisma/prisma.service';
import { PaginationHelper } from 'src/common/dto/pagination.dto';
import { IReceivedData } from 'src/interceptors/response.interceptor';
import { FindAllInvoicesDto, FindOneInvoiceDto, UpdateInvoiceDto } from './dto/invoice.dto';

@Injectable()
export class InvoiceService {
  constructor(private prisma: PrismaService) {}

  /**
   * Checks if an invoice should be marked as OVERDUE and updates it if necessary
   */
  private async checkAndUpdateOverdueStatus(invoice: Invoice): Promise<Invoice> {
    const now = new Date();
    const isOverdue = invoice.dueDate < now && invoice.status !== InvoiceStatus.PAID;

    if (isOverdue && invoice.status !== InvoiceStatus.OVERDUE) {
      return await this.prisma.invoice.update({
        where: { id: invoice.id },
        data: { status: InvoiceStatus.OVERDUE },
        include: { card: true },
      });
    }

    return invoice;
  }

  private calculateInvoices(transactions: Transaction[]): Map<string, { totalAmount: number }> {
    const invoicesMap = new Map<string, { totalAmount: number }>();

    transactions.forEach((transaction) => {
      const { installments, installmentsValue, amount, cardId, userId, installmentDates } = transaction;

      for (let i = 0; i < installments; i++) {
        // Use installmentDates array instead of calculating from purchaseDate
        const dateStr = installmentDates[i]; // Format: "MM/yyyy"
        const [month, year] = dateStr.split('/').map(Number);
        const key = `${cardId}-${userId}-${month}-${year}`;

        const installmentAmount = installmentsValue[i] ?? Number(amount) / installments;

        if (!invoicesMap.has(key)) {
          invoicesMap.set(key, { totalAmount: 0 });
        }

        invoicesMap.get(key)!.totalAmount += Number(installmentAmount);
      }
    });

    return invoicesMap;
  }

  private async upsertInvoices(invoicesMap: Map<string, { totalAmount: number }>) {
    for (const [key, { totalAmount }] of invoicesMap) {
      const [cardId, userId, month, year] = key.split('-');

      // Fetch card to get the actual dueDay
      const card = await this.prisma.card.findUnique({
        where: { id: cardId },
        select: { dueDay: true },
      });

      if (!card) {
        throw new NotFoundException(`Card with id ${cardId} not found`);
      }

      await this.prisma.invoice.upsert({
        where: { cardId_userId_month_year: { cardId, userId, month: Number(month), year: Number(year) } },
        update: { totalAmount },
        create: {
          cardId,
          userId,
          month: Number(month),
          year: Number(year),
          totalAmount,
          dueDate: new Date(Number(year), Number(month) - 1, card.dueDay),
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

  async FindAll(userId: string, filters?: FindAllInvoicesDto): Promise<IReceivedData<Invoice[]>> {
    try {
      const { page = 1, limit = 10, sortBy = 'dueDate', sortOrder = 'asc' } = filters || {};

      const where: {
        userId: string;
        cardId?: string;
        month?: number;
        year?: number;
        status?: InvoiceStatus;
      } = { userId };

      // Apply filters
      if (filters?.cardId) {
        where.cardId = filters.cardId;
      }
      if (filters?.month !== undefined) {
        where.month = filters.month;
      }
      if (filters?.year !== undefined) {
        where.year = filters.year;
      }
      if (filters?.status) {
        where.status = filters.status;
      }

      const invoicesCount = await this.prisma.invoice.count({ where });

      const skip = PaginationHelper.calculateSkip(page, limit);

      const invoices = await this.prisma.invoice.findMany({
        where,
        orderBy: { [sortBy]: sortOrder },
        include: {
          card: true,
        },
        skip,
        take: limit,
      });

      if (invoices.length === 0) {
        throw new NotFoundException({
          statusCode: HttpStatus.NOT_FOUND,
          count: 0,
          message: 'No invoices found for this user',
          data: null,
        });
      }

      // Check and update overdue status for all invoices
      const updatedInvoices = await Promise.all(
        invoices.map((invoice) => this.checkAndUpdateOverdueStatus(invoice)),
      );

      const meta = PaginationHelper.calculateMeta(page, limit, invoicesCount);

      return {
        statusCode: HttpStatus.OK,
        count: invoicesCount,
        message: 'Invoices retrieved successfully',
        result: updatedInvoices,
        meta,
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

  async findOne(userId: string, filters: FindOneInvoiceDto): Promise<IReceivedData<Invoice>> {
    try {
      const where: {
        userId: string;
        id?: string;
        cardId?: string;
        month?: number;
        year?: number;
      } = { userId };

      if (filters.id) {
        where.id = filters.id;
      }
      if (filters.cardId && filters.month !== undefined && filters.year !== undefined) {
        where.cardId = filters.cardId;
        where.month = filters.month;
        where.year = filters.year;
      }

      const invoice = await this.prisma.invoice.findFirst({
        where,
        include: {
          card: true,
        },
      });

      if (!invoice) {
        throw new NotFoundException({
          statusCode: HttpStatus.NOT_FOUND,
          message: 'Invoice not found',
        });
      }

      // Check and update overdue status
      const updatedInvoice = await this.checkAndUpdateOverdueStatus(invoice);

      return {
        statusCode: HttpStatus.OK,
        message: 'Invoice retrieved successfully',
        result: updatedInvoice,
      };
    } catch (error) {
      if (error instanceof BadRequestException || error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException({
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Failed to retrieve invoice',
      });
    }
  }

  async update(
    invoiceId: string,
    userId: string,
    updateData: UpdateInvoiceDto,
  ): Promise<IReceivedData<Invoice>> {
    try {
      const invoice = await this.prisma.invoice.findFirst({
        where: { id: invoiceId, userId },
      });

      if (!invoice) {
        throw new NotFoundException({
          statusCode: HttpStatus.NOT_FOUND,
          message: 'Invoice not found',
        });
      }

      const dataToUpdate: {
        paidAmount?: Decimal;
        status?: InvoiceStatus;
      } = {};

      if (updateData.paidAmount !== undefined) {
        dataToUpdate.paidAmount = new Decimal(updateData.paidAmount);
      }

      if (updateData.status) {
        dataToUpdate.status = updateData.status;
      }

      // Auto-update status based on paidAmount
      if (dataToUpdate.paidAmount !== undefined) {
        const paidAmount = dataToUpdate.paidAmount;
        const totalAmount = new Decimal(invoice.totalAmount);

        if (paidAmount.gte(totalAmount)) {
          dataToUpdate.status = InvoiceStatus.PAID;
        } else if (paidAmount.gt(0)) {
          dataToUpdate.status = InvoiceStatus.PENDING;
        }
      }

      const updatedInvoice = await this.prisma.invoice.update({
        where: { id: invoiceId },
        data: dataToUpdate,
        include: {
          card: true,
        },
      });

      return {
        statusCode: HttpStatus.OK,
        message: 'Invoice updated successfully',
        result: updatedInvoice,
      };
    } catch (error) {
      if (error instanceof BadRequestException || error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException({
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Failed to update invoice',
      });
    }
  }

  async markAsPaid(invoiceId: string, userId: string, paidAmount?: string): Promise<IReceivedData<Invoice>> {
    try {
      const invoice = await this.prisma.invoice.findFirst({
        where: { id: invoiceId, userId },
      });

      if (!invoice) {
        throw new NotFoundException({
          statusCode: HttpStatus.NOT_FOUND,
          message: 'Invoice not found',
        });
      }

      const amountPaid = paidAmount ? new Decimal(paidAmount) : invoice.totalAmount;

      const updatedInvoice = await this.prisma.invoice.update({
        where: { id: invoiceId },
        data: {
          paidAmount: amountPaid,
          status: InvoiceStatus.PAID,
        },
        include: {
          card: true,
        },
      });

      return {
        statusCode: HttpStatus.OK,
        message: 'Invoice marked as paid successfully',
        result: updatedInvoice,
      };
    } catch (error) {
      if (error instanceof BadRequestException || error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException({
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Failed to mark invoice as paid',
      });
    }
  }

  async forecast(userId: string, months: number, cardId?: string): Promise<IReceivedData<Invoice[]>> {
    try {
      const today = new Date();
      const futureDate = addMonths(today, months);

      const where: {
        userId: string;
        dueDate: {
          gte: Date;
          lte: Date;
        };
        cardId?: string;
      } = {
        userId,
        dueDate: {
          gte: today,
          lte: futureDate,
        },
      };

      if (cardId) {
        where.cardId = cardId;
      }

      const invoices = await this.prisma.invoice.findMany({
        where,
        orderBy: { dueDate: 'asc' },
        include: {
          card: true,
        },
      });

      const invoicesCount = await this.prisma.invoice.count({ where });

      // Check and update overdue status for all invoices
      const updatedInvoices = await Promise.all(
        invoices.map((invoice) => this.checkAndUpdateOverdueStatus(invoice)),
      );

      return {
        statusCode: HttpStatus.OK,
        count: invoicesCount,
        message: `Invoices forecasted for the next ${months} month(s)`,
        result: updatedInvoices,
      };
    } catch (error) {
      if (error instanceof BadRequestException || error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException({
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Failed to forecast invoices',
      });
    }
  }
}
