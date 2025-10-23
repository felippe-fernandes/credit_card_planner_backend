import { HttpStatus } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import { Decimal } from '@prisma/client/runtime/library';
import {
  ArrayMinSize,
  ArrayNotEmpty,
  IsArray,
  IsDateString,
  IsDecimal,
  IsInt,
  IsNumberString,
  IsOptional,
  IsString,
  Matches,
  ValidateIf,
} from 'class-validator';
import { ResponseWithDataDto } from 'src/constants';

export class TransactionDto {
  @ApiProperty({ example: 'cm8vz6s4s0001wcm0tlmxqabc' })
  id: string;

  @ApiProperty({ example: 'cm8vsfvyx0001wce8b40bhum2' })
  cardId: string;

  @ApiProperty({ example: 'd5147b61-90d2-4b19-a987-c32e5e47e220' })
  userId: string;

  @ApiProperty({
    example: 'd5147b61-90d2-4b19-a987-c32e5e47e223',
    nullable: true,
  })
  dependentId: string | null;

  @ApiProperty({ example: 'Concert Tickets' })
  purchaseName: string;

  @ApiProperty({ example: 'Entertainment' })
  purchaseCategory: string;

  @ApiProperty({
    example: 'Live music event',
    nullable: true,
  })
  description: string | null;

  @ApiProperty({ example: '200.00', type: String })
  amount: Decimal;

  @ApiProperty({ example: '2025-03-22T20:15:00.000Z' })
  purchaseDate: Date;

  @ApiProperty({ example: 2 })
  installments: number;

  @ApiProperty({
    example: ['100.00', '100.00'],
    type: [String],
  })
  installmentsValue: Decimal[];

  @ApiProperty({
    example: ['04/2025', '05/2025'],
    type: [String],
  })
  installmentDates: string[];

  @ApiProperty({ example: '2025-03-22T20:15:00.000Z' })
  createdAt: Date;

  @ApiProperty({
    example: '2025-03-22T20:15:00.000Z',
    nullable: true,
  })
  editedAt: Date | null;
}

export class CreateTransactionDto {
  @ApiProperty({
    example: 'cm8vsfvyx0001wce8b40bhum2',
  })
  @IsString()
  cardId: string;

  @ApiProperty({
    example: 'Iphone 16',
  })
  @IsString()
  purchaseName: string;

  @ApiProperty({
    example: 'Shopping',
  })
  @IsString()
  purchaseCategory: string;

  @ApiProperty({
    example: 'New smartphone',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    example: '100000.00',
  })
  @IsNumberString()
  @IsDecimal()
  amount: number;

  @ApiProperty({
    example: 11,
  })
  @IsInt()
  installments: number;

  @ApiProperty({
    example: [3000, 700, 700, 700, 700, 700, 700, 700, 700, 700, 700],
    readOnly: true,
  })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateIf((obj: TransactionDto) => obj.installments > 1)
  @IsDecimal({}, { each: true })
  @IsOptional()
  installmentValues?: number[];

  @ApiProperty({
    example: '2025-03-30T16:36:06.092Z',
  })
  @IsDateString()
  @IsOptional()
  purchaseDate?: string;

  @ApiProperty({
    example: 'd5147b61-90d2-4b19-a987-c32e5e47e223',
  })
  @IsString()
  @IsOptional()
  dependentId?: string;
}

export class UpdateTransactionDto {
  @ApiProperty({
    example: 'cm8vsfvyx0001wce8b40bhum2',
  })
  @IsString()
  @IsOptional()
  purchaseName?: string;

  @ApiProperty({
    example: 'Shopping',
  })
  @IsString()
  @IsOptional()
  purchaseCategory?: string;

  @ApiProperty({
    example: 'New smartphone',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    example: '100000.00',
  })
  @IsNumberString()
  @IsDecimal()
  @IsOptional()
  amount?: number;

  @ApiProperty({
    example: 10,
  })
  @IsInt()
  @IsOptional()
  installments?: number;

  @ApiProperty({
    example: [3000, 700, 700, 700, 700, 700, 700, 700, 700, 700, 700],
    readOnly: true,
  })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateIf((obj: TransactionDto) => obj.installments > 1)
  @IsDecimal({}, { each: true })
  @IsOptional()
  installmentValues?: number[];

  @ApiProperty({
    example: '2025-03-30T16:36:06.092Z',
  })
  @IsDateString()
  @IsOptional()
  purchaseDate?: string;

  @ApiProperty({
    example: 'd5147b61-90d2-4b19-a987-c32e5e47e223',
  })
  @IsString()
  @IsOptional()
  dependentId?: string;
}

export class FindAllTransactionsDto {
  @ApiProperty({
    example: 'cm8vsfvyx0001wce8b40bhum2',
    required: false,
    description: 'Filter by card ID',
  })
  @IsOptional()
  @IsString()
  card?: string;

  @ApiProperty({
    example: 'd5147b61-90d2-4b19-a987-c32e5e47e223',
    required: false,
    description: 'Filter by dependent ID',
  })
  @IsOptional()
  @IsString()
  dependent?: string;

  @ApiProperty({
    example: 'Netflix',
    required: false,
    description: 'Search by purchase name (partial match)',
  })
  @IsOptional()
  @IsString()
  purchaseName?: string;

  @ApiProperty({
    example: 'Entertainment',
    required: false,
    description: 'Filter by purchase category',
  })
  @IsOptional()
  @IsString()
  purchaseCategory?: string;

  @ApiProperty({
    example: 6,
    required: false,
    description: 'Filter by number of installments',
  })
  @IsOptional()
  @IsInt()
  installments?: number;

  @ApiProperty({
    example: '2025-03-22T20:15:00.000Z',
    required: false,
    description: 'Filter by specific purchase date',
  })
  @IsOptional()
  @IsDateString()
  purchaseDate?: string;

  @ApiProperty({
    example: '2025-01-01T00:00:00.000Z',
    required: false,
    description: 'Filter by start date (inclusive)',
  })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiProperty({
    example: '2025-12-31T23:59:59.999Z',
    required: false,
    description: 'Filter by end date (inclusive)',
  })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiProperty({
    example: ['04/2025', '05/2025'],
    required: false,
    description: 'Filter by installment dates (format: MM/YYYY)',
  })
  @IsOptional()
  @IsArray()
  @ArrayNotEmpty()
  @Matches(/^(0[1-9]|1[0-2])\/\d{4}$/, {
    each: true,
    message: 'Each date in installmentsMonth must be in the format MM/YYYY',
  })
  installmentDates?: string[];
}

export class FindOneTransactionDto {
  @IsString()
  @IsOptional()
  id?: string;

  @IsString()
  @IsOptional()
  purchaseName?: string;

  @IsString()
  @IsOptional()
  dependentId?: string;

  @IsString()
  @IsOptional()
  cardId?: string;

  @IsString()
  @IsOptional()
  purchaseCategory?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsOptional()
  @IsDateString()
  purchaseDate?: string;
}

const resultSearchTransactions = [
  {
    id: 'cm8vz6s4s0001wcm0tlmxqabc',
    cardId: 'cm8vsfvyx0001wce8b40bhum3',
    userId: 'd5147b61-90d2-4b19-a987-c32e5e47e220',
    dependentId: 'd5147b61-90d2-4b19-a987-c32e5e47e220',
    purchaseName: 'Concert Tickets',
    purchaseCategory: 'Entertainment',
    description: 'Live music event',
    amount: '200',
    purchaseDate: '2025-03-22T20:15:00.000Z',
    installments: 2,
    installmentsValue: ['100', '100'],
    installmentDates: ['04/2025', '05/2025'],
    createdAt: '2025-03-22T20:15:00.000Z',
    editedAt: '2025-03-22T20:15:00.000Z',
    card: {
      name: 'Visa Gold',
    },
    dependent: {
      name: 'John Doe',
    },
  },
  {
    id: 'cm8vz6s4s0001wcm0tlmxqdef',
    cardId: 'cm8vsfvyx0001wce8b40bhum4',
    userId: 'd5147b61-90d2-4b19-a987-c32e5e47e220',
    dependentId: 'd5147b61-90d2-4b19-a987-c32e5e47e220',
    purchaseName: 'Organic Vegetables',
    purchaseCategory: 'Groceries',
    description: 'Fresh produce for the week',
    amount: '50',
    purchaseDate: '2025-03-28T11:00:00.000Z',
    installments: 1,
    installmentsValue: ['50'],
    installmentDates: ['04/2025'],
    createdAt: '2025-03-28T11:00:00.000Z',
    editedAt: '2025-03-28T11:00:00.000Z',
    card: {
      name: 'Mastercard Platinum',
    },
    dependent: {
      name: 'John Doe',
    },
  },
  {
    id: 'cm8vz6s4s0001wcm0tlmxqghi',
    cardId: 'cm8vsfvyx0001wce8b40bhum5',
    userId: 'd5147b61-90d2-4b19-a987-c32e5e47e220',
    dependentId: 'd5147b61-90d2-4b19-a987-c32e5e47e220',
    purchaseName: 'Taxi Ride',
    purchaseCategory: 'Transport',
    description: 'Ride to the airport',
    amount: '30',
    purchaseDate: '2025-03-30T06:00:00.000Z',
    installments: 1,
    installmentsValue: ['30'],
    installmentDates: ['04/2025'],
    createdAt: '2025-03-30T06:00:00.000Z',
    editedAt: '2025-03-30T06:00:00.000Z',
    card: {
      name: 'American Express',
    },
    dependent: {
      name: 'John Doe',
    },
  },
];

export class ResultFindAllTransactionsDto extends ResponseWithDataDto {
  @ApiProperty({
    example: resultSearchTransactions,
  })
  result: TransactionDto[];

  @ApiProperty({
    example: 3,
  })
  count: number;
}

export class ResultFindOneTransactionDto extends ResponseWithDataDto {
  @ApiProperty({
    example: resultSearchTransactions[0],
  })
  result: TransactionDto;

  @ApiProperty({
    example: 1,
  })
  count: number;
}

const resultCreateTransaction = {
  name: 'Food',
  icon: '🍔',
  color: '#FF5733',
  userId: 'd5147b61-90d2-4b19-a987-c32e5e47e220',
  createdAt: '2025-03-29T22:41:58.909Z',
  editedAt: '2025-03-29T22:41:58.909Z',
};

export class ResultCreateTransactionDto extends ResponseWithDataDto {
  @ApiProperty({
    example: resultCreateTransaction,
  })
  result: any;

  @ApiProperty({
    example: 1,
  })
  count: number;

  @ApiProperty({
    example: 201,
  })
  statusCode: HttpStatus;
}

export class ResultUpdateTransactionDto extends ResponseWithDataDto {
  @ApiProperty({
    example: resultCreateTransaction,
  })
  result: any;

  @ApiProperty({
    example: 1,
  })
  count: number;

  @ApiProperty({
    example: 200,
  })
  statusCode: HttpStatus;
}

export class ResultDeleteTransactionDto extends ResponseWithDataDto {
  @ApiProperty({
    example: { transactionId: 'mb1231xcaasd1234da' },
  })
  result: any;

  @ApiProperty({
    example: 1,
  })
  count: number;

  @ApiProperty({
    example: 200,
  })
  statusCode: HttpStatus;
}
