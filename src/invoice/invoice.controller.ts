import { Controller, Get, Param, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { InvoiceService } from './invoice.service';

@Controller('invoice')
@ApiTags('Invoice')
@ApiBearerAuth()
export class InvoiceController {
  constructor(private readonly invoiceService: InvoiceService) {}

  @Post('update')
  @ApiOperation({ summary: 'Update all invoices' })
  @ApiResponse({ status: 201, description: 'Invoices updated successfully' })
  @ApiResponse({ status: 400, description: 'Error updating invoices' })
  async updateInvoices() {
    return this.invoiceService.updateManyInvoices();
  }

  @Get(':userId')
  @ApiOperation({ summary: 'Get all invoices for a user' })
  @ApiResponse({ status: 200, description: 'Invoices retrieved successfully' })
  @ApiResponse({ status: 404, description: 'No invoices found for this user' })
  @ApiResponse({ status: 400, description: 'Failed to retrieve invoices' })
  @ApiParam({ name: 'userId', required: true, description: 'User ID' })
  async getInvoices(@Param('userId') userId: string) {
    return this.invoiceService.FindAll(userId);
  }
}
