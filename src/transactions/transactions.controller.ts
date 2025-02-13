import { Body, Controller, Delete, Get, Param, Post, Put, Query, Req, UseGuards } from '@nestjs/common';
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
@UseGuards(AuthGuard)
export class TransactionsController {
  constructor(private transactionsService: TransactionsService) {}

  @Get()
  async findAll(
    @Req() req: RequestWithUser,
    @Query('card') card?: string,
    @Query('dependent') dependent?: string,
    @Query('purchaseName') purchaseName?: string,
    @Query('purchaseCategory') purchaseCategory?: string,
    @Query('amount') amount?: string,
    @Query('purchaseDate') purchaseDate?: string,
    @Query('installments') installments?: string,
  ) {
    const userId = req.user.id;

    const amountDecimal = amount ? parseFloat(amount) : undefined;
    const installmentsNumber = installments ? parseInt(installments, 10) : undefined;

    const filters: FindAllTransactionsDto = {
      card,
      dependent,
      purchaseName,
      purchaseCategory,
      amount: amountDecimal,
      purchaseDate,
      installments: installmentsNumber,
    };

    return this.transactionsService.findAll(userId, filters);
  }

  @Get('/search')
  async findOneById(@Req() req: RequestWithUser, @Query('id') id?: string) {
    const userId = req.user.id;
    const query: FindOneTransactionDto = { id };
    return this.transactionsService.findOne(userId, query);
  }

  @Post()
  async create(@Req() req: RequestWithUser, @Body() createTransactionDto: CreateTransactionDto) {
    const userId = req.user.id;
    return this.transactionsService.create(userId, createTransactionDto);
  }

  @Put(':id')
  async update(
    @Req() req: RequestWithUser,
    @Param('id') transactionId: string,
    @Body() updateTransactionDto: UpdateTransactionDto,
  ) {
    const userId = req.user.id;
    return this.transactionsService.update(userId, transactionId, updateTransactionDto);
  }

  @Delete(':id')
  async remove(@Req() req: RequestWithUser, @Param('id') transactionId: string) {
    const userId = req.user.id;
    return this.transactionsService.remove(userId, transactionId);
  }
}
