import { Body, Controller, Delete, Get, Param, Post, Put, Query, Req, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
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
  CreateTransactionDto,
  FindAllTransactionsDto,
  FindOneTransactionDto,
  ResultCreateTransactionDto,
  ResultDeleteTransactionDto,
  ResultFindAllTransactionsDto,
  ResultFindOneTransactionDto,
  ResultUpdateTransactionDto,
  UpdateTransactionDto,
} from './dto/transaction.dto';
import { TransactionsService } from './transactions.service';

@Controller('transactions')
@ApiTags('Transactions')
@ApiBearerAuth()
@ApiErrorDefaultResponses()
@UseGuards(AuthGuard)
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Get()
  @ApiOperation({ summary: 'Retrieve all transactions' })
  @ApiOkResponse({ type: ResultFindAllTransactionsDto })
  @ApiNotFoundResponse({ type: ResponseNotFoundDto })
  @ApiQuery({ name: 'card', required: false, description: 'Card ID' })
  @ApiQuery({ name: 'dependent', required: false, description: 'Dependent ID' })
  @ApiQuery({ name: 'purchaseName', required: false, description: 'Purchase name' })
  @ApiQuery({ name: 'purchaseCategory', required: false, description: 'Purchase category' })
  @ApiQuery({ name: 'purchaseDate', required: false, description: 'Purchase date' })
  @ApiQuery({ name: 'installments', required: false, description: 'Number of installments' })
  @ApiQuery({
    name: 'installmentDates',
    required: false,
    description: 'Installment dates. E.g. 02/2025, 05/2025',
  })
  async findAll(
    @Req() req: RequestWithUser,
    @Query('card') card?: string,
    @Query('dependent') dependent?: string,
    @Query('purchaseName') purchaseName?: string,
    @Query('purchaseCategory') purchaseCategory?: string,
    @Query('purchaseDate') purchaseDate?: string,
    @Query('installments') installments?: string,
    @Query('installmentDates') installmentDates?: string,
  ) {
    const userId = req.user.id;
    const installmentsNumber = installments ? parseInt(installments, 10) : undefined;

    const parsedInstallmentsMonth = Array.isArray(installmentDates)
      ? installmentDates
      : installmentDates?.split(',').map((v) => v.trim());

    const filters: FindAllTransactionsDto = {
      card,
      dependent,
      purchaseName,
      purchaseCategory,
      purchaseDate,
      installments: installmentsNumber,
      installmentDates: parsedInstallmentsMonth,
    };

    return this.transactionsService.findAll(userId, filters);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new transaction' })
  @ApiCreatedResponse({ type: ResultCreateTransactionDto })
  async create(@Req() req: RequestWithUser, @Body() createTransactionDto: CreateTransactionDto) {
    const userId = req.user.id;
    return this.transactionsService.create(userId, createTransactionDto);
  }

  @Get('/search')
  @ApiOperation({ summary: 'Retrieve a transaction by ID' })
  @ApiOkResponse({ type: ResultFindOneTransactionDto })
  @ApiNotFoundResponse({ type: ResponseNotFoundDto })
  @ApiQuery({ name: 'id', required: false, description: 'Transaction ID' })
  @ApiQuery({ name: 'purchaseName', required: false, description: 'Purchase name' })
  @ApiQuery({ name: 'dependentId', required: false, description: 'Dependent ID' })
  @ApiQuery({ name: 'cardId', required: false, description: 'Card ID' })
  @ApiQuery({ name: 'purchaseCategory', required: false, description: 'Purchase category' })
  @ApiQuery({ name: 'description', required: false, description: 'Description' })
  @ApiQuery({ name: 'purchaseDate', required: false, description: 'Purchase date' })
  async findOne(
    @Req() req: RequestWithUser,
    @Query('id') id?: string,
    @Query('purchaseName') purchaseName?: string,
    @Query('dependentId') dependentId?: string,
    @Query('cardId') cardId?: string,
    @Query('purchaseCategory') purchaseCategory?: string,
    @Query('description') description?: string,
    @Query('purchaseDate') purchaseDate?: string,
  ) {
    const userId = req.user.id;
    const filters: FindOneTransactionDto = {
      id,
      purchaseName,
      dependentId,
      cardId,
      purchaseCategory,
      description,
      purchaseDate,
    };
    return this.transactionsService.findOne(userId, filters);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a transaction' })
  @ApiOkResponse({ type: ResultUpdateTransactionDto })
  @ApiParam({ name: 'id', required: true, description: 'Transaction ID' })
  async update(
    @Req() req: RequestWithUser,
    @Param('id') transactionId: string,
    @Body() updateTransactionDto: UpdateTransactionDto,
  ) {
    const userId = req.user.id;
    return this.transactionsService.update(userId, transactionId, updateTransactionDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a transaction' })
  @ApiOkResponse({ type: ResultDeleteTransactionDto })
  @ApiParam({ name: 'id', required: true, description: 'Transaction ID' })
  async remove(@Req() req: RequestWithUser, @Param('id') transactionId: string) {
    const userId = req.user.id;
    return this.transactionsService.remove(userId, transactionId);
  }
}
