import { Body, Controller, Get, Param, Patch, Post, Put, Query, Req, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiExtraModels,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { AuthGuard } from 'src/auth/auth.guard';
import { RequestWithUser } from 'src/auth/interfaces/auth.interface';
import { ResponseNotFoundDto } from 'src/constants';
import { ApiErrorDefaultResponses } from 'src/decorators/api-error-default-response.decorators';
import {
  EnumInvoiceStatusDto,
  FindAllInvoicesDto,
  FindOneInvoiceDto,
  MarkInvoiceAsPaidDto,
  ResultFindAllInvoiceDto,
  ResultFindOneInvoiceDto,
  ResultMarkAsPaidDto,
  ResultUpdateAllInvoicesDto,
  ResultUpdateInvoiceDto,
  UpdateInvoiceDto,
} from './dto/invoice.dto';
import { InvoiceService } from './invoice.service';

@Controller('invoice')
@ApiTags('Invoice')
@ApiBearerAuth()
@ApiExtraModels(EnumInvoiceStatusDto)
@ApiErrorDefaultResponses()
@UseGuards(AuthGuard)
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

  @Get()
  @ApiOperation({
    summary: 'Retrieve all invoices for the authenticated user with optional filters',
    operationId: 'getAllInvoices',
  })
  @ApiOkResponse({ type: ResultFindAllInvoiceDto })
  @ApiNotFoundResponse({ type: ResponseNotFoundDto })
  @ApiQuery({ name: 'cardId', required: false, description: 'Filter by card ID' })
  @ApiQuery({ name: 'month', required: false, type: Number, description: 'Filter by month (1-12)' })
  @ApiQuery({ name: 'year', required: false, type: Number, description: 'Filter by year' })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: ['PENDING', 'PAID', 'OVERDUE'],
    description: 'Filter by invoice status',
  })
  async getAllInvoices(
    @Req() req: RequestWithUser,
    @Query('cardId') cardId?: string,
    @Query('month') month?: string,
    @Query('year') year?: string,
    @Query('status') status?: string,
  ) {
    const userId = req.user.id;
    const monthNumber = month ? parseInt(month, 10) : undefined;
    const yearNumber = year ? parseInt(year, 10) : undefined;

    const filters: FindAllInvoicesDto = {
      cardId,
      month: monthNumber,
      year: yearNumber,
      status: status as any,
    };

    return this.invoiceService.FindAll(userId, filters);
  }

  @Get('search')
  @ApiOperation({
    summary: 'Find a specific invoice by ID or by card + month + year combination',
    operationId: 'findOneInvoice',
  })
  @ApiOkResponse({ type: ResultFindOneInvoiceDto })
  @ApiNotFoundResponse({ type: ResponseNotFoundDto })
  @ApiQuery({ name: 'id', required: false, description: 'Invoice ID' })
  @ApiQuery({ name: 'cardId', required: false, description: 'Card ID (required with month and year)' })
  @ApiQuery({
    name: 'month',
    required: false,
    type: Number,
    description: 'Month (1-12, required with cardId and year)',
  })
  @ApiQuery({
    name: 'year',
    required: false,
    type: Number,
    description: 'Year (required with cardId and month)',
  })
  async findOneInvoice(
    @Req() req: RequestWithUser,
    @Query('id') id?: string,
    @Query('cardId') cardId?: string,
    @Query('month') month?: string,
    @Query('year') year?: string,
  ) {
    const userId = req.user.id;
    const monthNumber = month ? parseInt(month, 10) : undefined;
    const yearNumber = year ? parseInt(year, 10) : undefined;

    const filters: FindOneInvoiceDto = {
      id,
      cardId,
      month: monthNumber,
      year: yearNumber,
    };

    return this.invoiceService.findOne(userId, filters);
  }

  @Get('forecast')
  @ApiOperation({
    summary: 'Forecast invoices for the next X months',
    operationId: 'forecastInvoices',
  })
  @ApiOkResponse({ type: ResultFindAllInvoiceDto })
  @ApiQuery({
    name: 'months',
    required: true,
    type: Number,
    description: 'Number of months to forecast ahead',
  })
  @ApiQuery({ name: 'cardId', required: false, description: 'Filter forecast by specific card ID' })
  async forecastInvoices(
    @Req() req: RequestWithUser,
    @Query('months') months: string,
    @Query('cardId') cardId?: string,
  ) {
    const userId = req.user.id;
    const monthsNumber = parseInt(months, 10);
    return this.invoiceService.forecast(userId, monthsNumber, cardId);
  }

  @Put(':id')
  @ApiOperation({
    summary: 'Update invoice payment information',
    operationId: 'updateInvoice',
  })
  @ApiOkResponse({ type: ResultUpdateInvoiceDto })
  @ApiNotFoundResponse({ type: ResponseNotFoundDto })
  @ApiParam({ name: 'id', required: true, description: 'Invoice ID' })
  async updateInvoice(
    @Req() req: RequestWithUser,
    @Param('id') invoiceId: string,
    @Body() updateData: UpdateInvoiceDto,
  ) {
    const userId = req.user.id;
    return this.invoiceService.update(invoiceId, userId, updateData);
  }

  @Patch(':id/mark-paid')
  @ApiOperation({
    summary: 'Mark invoice as paid',
    operationId: 'markInvoiceAsPaid',
  })
  @ApiOkResponse({ type: ResultMarkAsPaidDto })
  @ApiNotFoundResponse({ type: ResponseNotFoundDto })
  @ApiParam({ name: 'id', required: true, description: 'Invoice ID' })
  async markInvoiceAsPaid(
    @Req() req: RequestWithUser,
    @Param('id') invoiceId: string,
    @Body() body: MarkInvoiceAsPaidDto,
  ) {
    const userId = req.user.id;
    return this.invoiceService.markAsPaid(invoiceId, userId, body.paidAmount);
  }
}
