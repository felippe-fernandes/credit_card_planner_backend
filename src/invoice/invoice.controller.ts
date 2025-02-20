import { Controller, Get, Param, Post } from '@nestjs/common';
import { InvoiceService } from './invoice.service';

@Controller('invoice')
export class InvoiceController {
  constructor(private readonly invoiceService: InvoiceService) {}

  @Post('update')
  async updateInvoices() {
    return this.invoiceService.updateManyInvoices();
  }

  @Get(':userId')
  async getInvoices(@Param('userId') userId: string) {
    return this.invoiceService.FindAll(userId);
  }
}
