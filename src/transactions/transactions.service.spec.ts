import { BadRequestException, HttpStatus, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Decimal } from '@prisma/client/runtime/library';
import { PrismaService } from '../../prisma/prisma.service';
import { TransactionsService } from './transactions.service';

describe('TransactionsService', () => {
  let service: TransactionsService;
  let prismaService: any;

  const userId = 'd5147b61-90d2-4b19-a987-c32e5e47e220';
  const cardId = 'cm8vsfvyx0001wce8b40bhum2';
  const transactionId = 'cm8vz6s4s0001wcm0tlmxqabc';

  const mockCard = {
    id: cardId,
    userId,
    name: 'Test Card',
    bank: 'Test Bank',
    flag: 'Visa',
    limit: new Decimal(5000),
    availableLimit: new Decimal(4900),
    simulatedLimit: new Decimal(5000),
    dueDay: 10,
    payDay: 5,
    createdAt: new Date('2025-01-01'),
    editedAt: null,
  };

  const mockTransaction = {
    id: transactionId,
    cardId,
    userId,
    dependentId: userId,
    purchaseName: 'Test Purchase',
    purchaseCategory: 'Food',
    description: 'Test description',
    amount: new Decimal(100),
    purchaseDate: new Date('2025-01-15'),
    installments: 1,
    installmentsValue: ['100.00'],
    installmentDates: ['02/2025'],
    createdAt: new Date(),
    editedAt: null,
  };

  beforeEach(async () => {
    const mockPrismaService = {
      transaction: {
        count: jest.fn(),
        findMany: jest.fn(),
        findFirst: jest.fn(),
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
        aggregate: jest.fn(),
      },
      card: {
        findUnique: jest.fn(),
        update: jest.fn(),
      },
      $transaction: jest.fn((callback) => callback(mockPrismaService)),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TransactionsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<TransactionsService>(TransactionsService);
    prismaService = module.get(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return paginated transactions with default parameters', async () => {
      const mockTransactions = [mockTransaction];
      prismaService.transaction.count.mockResolvedValue(1);
      prismaService.transaction.findMany.mockResolvedValue(mockTransactions);

      const result = await service.findAll(userId, {
        page: 1,
        limit: 10,
        sortBy: 'createdAt',
        sortOrder: 'desc' as any,
      });

      expect(result).toEqual({
        statusCode: HttpStatus.OK,
        count: 1,
        message: 'Transactions retrieved successfully',
        result: mockTransactions,
        meta: {
          page: 1,
          limit: 10,
          total: 1,
          totalPages: 1,
          hasNextPage: false,
          hasPreviousPage: false,
        },
      });

      expect(prismaService.transaction.count).toHaveBeenCalledTimes(1);
      expect(prismaService.transaction.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: { createdAt: 'desc' },
          skip: 0,
          take: 10,
        }),
      );
    });

    it('should apply card filter correctly', async () => {
      prismaService.transaction.count.mockResolvedValue(1);
      prismaService.transaction.findMany.mockResolvedValue([mockTransaction]);

      await service.findAll(userId, {
        card: cardId,
        page: 1,
        limit: 10,
      });

      expect(prismaService.transaction.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            AND: expect.objectContaining({
              card: { id: cardId },
            }),
          }),
        }),
      );
    });

    it('should apply purchase name filter with case insensitive search', async () => {
      prismaService.transaction.count.mockResolvedValue(1);
      prismaService.transaction.findMany.mockResolvedValue([mockTransaction]);

      await service.findAll(userId, {
        purchaseName: 'Test',
        page: 1,
        limit: 10,
      });

      expect(prismaService.transaction.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            AND: expect.objectContaining({
              purchaseName: { contains: 'Test', mode: 'insensitive' as const },
            }),
          }),
        }),
      );
    });

    it('should apply date range filters correctly', async () => {
      prismaService.transaction.count.mockResolvedValue(1);
      prismaService.transaction.findMany.mockResolvedValue([mockTransaction]);

      const startDate = '2025-01-01T00:00:00.000Z';
      const endDate = '2025-01-31T23:59:59.999Z';

      await service.findAll(userId, {
        startDate,
        endDate,
        page: 1,
        limit: 10,
      });

      expect(prismaService.transaction.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            AND: expect.objectContaining({
              purchaseDate: {
                gte: new Date(startDate),
                lte: new Date(endDate),
              },
            }),
          }),
        }),
      );
    });

    it('should apply installment dates filter', async () => {
      prismaService.transaction.count.mockResolvedValue(1);
      prismaService.transaction.findMany.mockResolvedValue([mockTransaction]);

      await service.findAll(userId, {
        installmentDates: ['02/2025', '03/2025'],
        page: 1,
        limit: 10,
      });

      expect(prismaService.transaction.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            AND: expect.objectContaining({
              installmentDates: { hasSome: ['02/2025', '03/2025'] },
            }),
          }),
        }),
      );
    });

    it('should calculate pagination metadata correctly for middle page', async () => {
      prismaService.transaction.count.mockResolvedValue(50);
      prismaService.transaction.findMany.mockResolvedValue([mockTransaction]);

      const result = await service.findAll(userId, {
        page: 3,
        limit: 10,
      });

      expect(result.meta).toEqual({
        page: 3,
        limit: 10,
        total: 50,
        totalPages: 5,
        hasNextPage: true,
        hasPreviousPage: true,
      });

      expect(prismaService.transaction.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 20,
          take: 10,
        }),
      );
    });

    it('should throw NotFoundException when no transactions found', async () => {
      prismaService.transaction.count.mockResolvedValue(0);
      prismaService.transaction.findMany.mockResolvedValue([]);

      await expect(service.findAll(userId, {})).rejects.toThrow(NotFoundException);
      await expect(service.findAll(userId, {})).rejects.toThrow('No transactions found for this user');
    });

    it('should handle BadRequestException and rethrow', async () => {
      prismaService.transaction.count.mockRejectedValue(new BadRequestException('Test error'));

      await expect(service.findAll(userId, {})).rejects.toThrow(BadRequestException);
    });
  });

  describe('create', () => {
    const createDto = {
      cardId,
      purchaseName: 'New Purchase',
      purchaseCategory: 'Food',
      amount: 200,
      installments: 2,
      purchaseDate: '2025-01-15T00:00:00.000Z',
    };

    it('should create a transaction successfully', async () => {
      prismaService.card.findUnique.mockResolvedValue(mockCard);
      prismaService.transaction.findUnique.mockResolvedValue(null);
      prismaService.transaction.create.mockResolvedValue(mockTransaction);
      prismaService.transaction.aggregate.mockResolvedValue({ _sum: { amount: new Decimal(100) } });
      prismaService.card.update.mockResolvedValue(mockCard);

      const result = await service.create(userId, createDto);

      expect(result).toEqual({
        statusCode: HttpStatus.CREATED,
        message: 'Transaction created successfully',
        result: mockTransaction,
      });

      expect(prismaService.card.findUnique).toHaveBeenCalledWith({ where: { id: cardId } });
      expect(prismaService.transaction.create).toHaveBeenCalled();
    });

    it('should throw BadRequestException when card not found', async () => {
      prismaService.card.findUnique.mockResolvedValue(null);

      await expect(service.create(userId, createDto)).rejects.toThrow(BadRequestException);
      await expect(service.create(userId, createDto)).rejects.toThrow('Card not found');
    });

    it('should throw BadRequestException for duplicate transaction', async () => {
      prismaService.card.findUnique.mockResolvedValue(mockCard);
      prismaService.transaction.findUnique.mockResolvedValue(mockTransaction);

      await expect(service.create(userId, createDto)).rejects.toThrow(BadRequestException);
      await expect(service.create(userId, createDto)).rejects.toThrow(
        'Transaction with the same name and value already exists',
      );
    });

    it('should use userId as dependentId when not provided', async () => {
      prismaService.card.findUnique.mockResolvedValue(mockCard);
      prismaService.transaction.findUnique.mockResolvedValue(null);
      prismaService.transaction.create.mockResolvedValue(mockTransaction);
      prismaService.transaction.aggregate.mockResolvedValue({ _sum: { amount: new Decimal(100) } });

      await service.create(userId, createDto);

      expect(prismaService.transaction.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            dependentId: userId,
          }),
        }),
      );
    });

    it('should update card available limit after creating transaction', async () => {
      prismaService.card.findUnique.mockResolvedValue(mockCard);
      prismaService.transaction.findUnique.mockResolvedValue(null);
      prismaService.transaction.create.mockResolvedValue(mockTransaction);
      prismaService.transaction.aggregate.mockResolvedValue({ _sum: { amount: new Decimal(200) } });
      prismaService.card.update.mockResolvedValue(mockCard);

      await service.create(userId, createDto);

      expect(prismaService.$transaction).toHaveBeenCalled();
      expect(prismaService.card.update).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should find transaction by id', async () => {
      prismaService.transaction.findFirst.mockResolvedValue(mockTransaction);

      const result = await service.findOne(userId, { id: transactionId });

      expect(result).toEqual({
        statusCode: HttpStatus.OK,
        count: 1,
        message: 'Transaction retrieved successfully',
        result: mockTransaction,
      });

      expect(prismaService.transaction.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            userId,
            AND: expect.objectContaining({
              id: transactionId,
            }),
          }),
        }),
      );
    });

    it('should find transaction by purchase name', async () => {
      prismaService.transaction.findFirst.mockResolvedValue(mockTransaction);

      await service.findOne(userId, { purchaseName: 'Test Purchase' });

      expect(prismaService.transaction.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            AND: expect.objectContaining({
              purchaseName: 'Test Purchase',
            }),
          }),
        }),
      );
    });

    it('should throw BadRequestException when no filters provided', async () => {
      await expect(service.findOne(userId, {})).rejects.toThrow(BadRequestException);
      await expect(service.findOne(userId, {})).rejects.toThrow(
        'Please provide at least one parameter to search for a transaction',
      );
    });

    it('should throw NotFoundException when transaction not found', async () => {
      prismaService.transaction.findFirst.mockResolvedValue(null);

      await expect(service.findOne(userId, { id: 'invalid-id' })).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    const updateDto = {
      purchaseName: 'Updated Purchase',
      amount: 150,
    };

    it('should update transaction successfully', async () => {
      const updatedTransaction = { ...mockTransaction, ...updateDto, amount: new Decimal(150) };

      prismaService.transaction.findUnique.mockResolvedValue(mockTransaction);
      prismaService.card.findUnique.mockResolvedValue(mockCard);
      prismaService.transaction.update.mockResolvedValue(updatedTransaction);
      prismaService.transaction.aggregate.mockResolvedValue({ _sum: { amount: new Decimal(150) } });

      const result = await service.update(userId, transactionId, updateDto);

      expect(result).toEqual({
        statusCode: HttpStatus.OK,
        count: 1,
        message: 'Transaction updated successfully',
        result: updatedTransaction,
      });

      expect(prismaService.transaction.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: transactionId },
        }),
      );
    });

    it('should throw NotFoundException when transaction not found', async () => {
      prismaService.transaction.findUnique.mockResolvedValue(null);

      await expect(service.update(userId, 'invalid-id', updateDto)).rejects.toThrow(NotFoundException);
    });

    it('should recalculate installments when amount changes', async () => {
      prismaService.transaction.findUnique.mockResolvedValue(mockTransaction);
      prismaService.card.findUnique.mockResolvedValue(mockCard);
      prismaService.transaction.update.mockResolvedValue(mockTransaction);
      prismaService.transaction.aggregate.mockResolvedValue({ _sum: { amount: new Decimal(150) } });

      await service.update(userId, transactionId, { amount: 300, installments: 3 });

      expect(prismaService.transaction.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            amount: new Decimal(300),
          }),
        }),
      );
    });
  });

  describe('remove', () => {
    it('should delete transaction successfully', async () => {
      prismaService.transaction.findUnique.mockResolvedValue(mockTransaction);
      prismaService.transaction.delete.mockResolvedValue(mockTransaction);
      prismaService.transaction.aggregate.mockResolvedValue({ _sum: { amount: new Decimal(0) } });
      prismaService.card.findUnique.mockResolvedValue(mockCard);

      const result = await service.remove(userId, transactionId);

      expect(result).toEqual({
        result: { transactionId },
        statusCode: HttpStatus.OK,
        message: 'Transaction deleted successfully',
        count: 1,
      });

      expect(prismaService.transaction.delete).toHaveBeenCalledWith({ where: { id: transactionId } });
    });

    it('should throw NotFoundException when transaction not found', async () => {
      prismaService.transaction.findUnique.mockResolvedValue(null);

      await expect(service.remove(userId, 'invalid-id')).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException when userId does not match', async () => {
      prismaService.transaction.findUnique.mockResolvedValue({
        ...mockTransaction,
        userId: 'different-user-id',
      });

      await expect(service.remove(userId, transactionId)).rejects.toThrow(NotFoundException);
    });

    it('should update card available limit after deletion', async () => {
      prismaService.transaction.findUnique.mockResolvedValue(mockTransaction);
      prismaService.transaction.delete.mockResolvedValue(mockTransaction);
      prismaService.transaction.aggregate.mockResolvedValue({ _sum: { amount: new Decimal(0) } });
      prismaService.card.findUnique.mockResolvedValue(mockCard);

      await service.remove(userId, transactionId);

      expect(prismaService.$transaction).toHaveBeenCalled();
    });
  });
});
