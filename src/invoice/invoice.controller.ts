import { Controller, Get, Param, Post } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { ResponseNotFoundDto } from 'src/constants';
import { ApiErrorDefaultResponses } from 'src/decorators/api-error-default-response.decorators';
import { ResultFindAllInvoiceDto, ResultUpdateAllInvoicesDto } from './dto/invoice.dto';
import { InvoiceService } from './invoice.service';

@Controller('invoice')
@ApiTags('Invoice')
@ApiBearerAuth()
@ApiErrorDefaultResponses()
export class InvoiceController {
  constructor(private readonly invoiceService: InvoiceService) {}

  @Post('update')
  @ApiOperation({
    summary: 'Update all invoices',
    operationId: 'updateAllInvoices',
  })
  @ApiCreatedResponse({ type: ResultUpdateAllInvoicesDto })
  async updateAllInvoices() {
    return this.invoiceService.updateManyInvoices();
  }

  @Get(':userId')
  @ApiOperation({
    summary: 'Get all invoices for a user',
    operationId: 'getUserInvoices',
  })
  @ApiOkResponse({ type: ResultFindAllInvoiceDto })
  @ApiNotFoundResponse({ type: ResponseNotFoundDto })
  @ApiParam({ name: 'userId', description: 'User ID' })
  async getUserInvoices(@Param('userId') userId: string) {
    return this.invoiceService.FindAll(userId);
  }
}
