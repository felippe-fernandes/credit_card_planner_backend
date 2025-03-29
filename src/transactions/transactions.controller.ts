import { Body, Controller, Delete, Get, Param, Post, Put, Query, Req, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AuthGuard } from 'src/auth/auth.guard';
import { RequestWithUser } from 'src/auth/interfaces/auth.interface';
import {
  CreateTransactionDto,
  FindAllTransactionsDto,
  FindOneTransactionDto,
  UpdateTransactionDto,
} from './dto/transaction.dto';
import { TransactionsService } from './transactions.service';

@Controller('transactions')
@ApiTags('Transactions')
@ApiBearerAuth()
@UseGuards(AuthGuard)
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Get()
  @ApiOperation({ summary: 'Retrieve all transactions' })
  @ApiResponse({ status: 200, description: 'List of transactions successfully retrieved.' })
  @ApiQuery({ name: 'card', required: false, description: 'Card ID' })
  @ApiQuery({ name: 'dependent', required: false, description: 'Dependent ID' })
  @ApiQuery({ name: 'purchaseName', required: false, description: 'Purchase name' })
  @ApiQuery({ name: 'purchaseCategory', required: false, description: 'Purchase category' })
  @ApiQuery({ name: 'purchaseDate', required: false, description: 'Purchase date' })
  @ApiQuery({ name: 'installments', required: false, description: 'Number of installments' })
  @ApiQuery({
    name: 'installmentDates',
    required: false,
    description: 'Installment dates',
    example: '02/2025,05/2025',
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

  @Get('/search')
  @ApiOperation({ summary: 'Retrieve a transaction by ID' })
  @ApiResponse({ status: 200, description: 'Transaction found.' })
  @ApiResponse({ status: 404, description: 'Transaction not found.' })
  @ApiQuery({ name: 'id', required: false, description: 'Transaction ID' })
  @ApiQuery({ name: 'purchaseName', required: false, description: 'Purchase name' })
  @ApiQuery({ name: 'dependentId', required: false, description: 'Dependent ID' })
  @ApiQuery({ name: 'cardId', required: false, description: 'Card ID' })
  @ApiQuery({ name: 'purchaseCategory', required: false, description: 'Purchase category' })
  @ApiQuery({ name: 'description', required: false, description: 'Description' })
  @ApiQuery({ name: 'purchaseDate', required: false, description: 'Purchase date' })
  @ApiQuery({ name: 'installments', required: false, description: 'Number of installments' })
  async findOne(
    @Req() req: RequestWithUser,
    @Query('id') id?: string,
    @Query('purchaseName') purchaseName?: string,
    @Query('dependentId') dependentId?: string,
    @Query('cardId') cardId?: string,
    @Query('purchaseCategory') purchaseCategory?: string,
    @Query('description') description?: string,
    @Query('purchaseDate') purchaseDate?: string,
    @Query('installments') installments?: string,
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
      installments,
    };
    return this.transactionsService.findOne(userId, filters);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new transaction' })
  @ApiResponse({ status: 201, description: 'Transaction successfully created.' })
  @ApiResponse({ status: 400, description: 'Invalid data.' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        purchaseName: { type: 'string', example: 'Groceries' },
        purchaseCategory: { type: 'string', example: 'Food' },
        purchaseDate: { type: 'string', example: '2023-10-01' },
        installments: { type: 'number', example: 3 },
        cardId: { type: 'string', example: 'cardId123' },
        dependentId: { type: 'string', example: 'dependentId123' },
        description: { type: 'string', example: 'Monthly groceries' },
        amount: { type: 'number', example: 150.0 },
        installmentValues: { type: 'array', items: { type: 'number' }, example: [50.0, 50.0, 50.0] },
      },
    },
  })
  async create(@Req() req: RequestWithUser, @Body() createTransactionDto: CreateTransactionDto) {
    const userId = req.user.id;
    return this.transactionsService.create(userId, createTransactionDto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a transaction' })
  @ApiResponse({ status: 200, description: 'Transaction successfully updated.' })
  @ApiResponse({ status: 404, description: 'Transaction not found.' })
  @ApiParam({ name: 'id', required: true, description: 'Transaction ID' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        purchaseName: { type: 'string', example: 'Updated Groceries' },
        purchaseCategory: { type: 'string', example: 'Updated Food' },
        purchaseDate: { type: 'string', example: '2023-10-02' },
        installments: { type: 'number', example: 4 },
        cardId: { type: 'string', example: 'updatedCardId123' },
        dependentId: { type: 'string', example: 'updatedDependentId123' },
        description: { type: 'string', example: 'Updated monthly groceries' },
        amount: { type: 'number', example: 200.0 },
        installmentValues: { type: 'array', items: { type: 'number' }, example: [50.0, 50.0, 50.0, 50.0] },
      },
    },
  })
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
  @ApiResponse({ status: 200, description: 'Transaction successfully deleted.' })
  @ApiResponse({ status: 404, description: 'Transaction not found.' })
  @ApiParam({ name: 'id', required: true, description: 'Transaction ID' })
  async remove(@Req() req: RequestWithUser, @Param('id') transactionId: string) {
    const userId = req.user.id;
    return this.transactionsService.remove(userId, transactionId);
  }
}
