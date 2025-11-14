import { HttpStatus } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import { Decimal } from '@prisma/client/runtime/library';
import { Type } from 'class-transformer';
import { IsDate, IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { ResponseWithDataDto } from 'src/constants';

const resultSearchInvoices = [
  {
    id: 'a1b2c3d4-5678-90ab-cdef-1234567890ab',
    cardId: 'cm8vsfvyx0001wce8b40bhum2',
    userId: 'd5147b61-90d2-4b19-a987-c32e5e47e220',
    month: 2,
    year: 2025,
    totalAmount: '2500.75',
    paidAmount: '500.00',
    dueDate: '2025-03-25T00:00:00.000Z',
    status: 'PENDING',
    createdAt: '2025-02-15T22:41:58.909Z',
    editedAt: '2025-02-15T22:41:58.909Z',
  },
  {
    id: 'f4e5d6c7-89ab-01cd-ef23-456789abcd12',
    cardId: 'cm8vsfvyx0001wce8b40bhum2',
    userId: 'd5147b61-90d2-4b19-a987-c32e5e47e220',
    month: 2,
    year: 2025,
    totalAmount: '1800.5',
    paidAmount: '1800.5',
    dueDate: '2025-02-25T00:00:00.000Z',
    status: 'PAID',
    createdAt: '2025-03-29T22:41:58.909Z',
    editedAt: '2025-03-29T22:41:58.909Z',
  },
  {
    id: '98ab76cd-5432-1ef0-9abc-345678def901',
    cardId: 'cm8vsfvyx0001wce8b40bhum2',
    userId: 'd5147b61-90d2-4b19-a987-c32e5e47e220',
    month: 1,
    year: 2025,
    totalAmount: '3200.00',
    paidAmount: '1000.00',
    dueDate: '2025-01-25T00:00:00.000Z',
    status: 'OVERDUE',
    createdAt: '2025-03-29T22:41:58.909Z',
    editedAt: '2025-03-29T22:41:58.909Z',
  },
];

export enum InvoiceStatusDto {
  PENDING = 'PENDING',
  PAID = 'PAID',
  OVERDUE = 'OVERDUE',
}

export class EnumInvoiceStatusDto {
  @ApiProperty({ enum: InvoiceStatusDto, example: InvoiceStatusDto.PENDING })
  status: InvoiceStatusDto;
}

export class InvoiceDto {
  @ApiProperty({ example: 'a1b2c3d4-5678-90ab-cdef-1234567890ab' })
  @IsString()
  id: string;

  @ApiProperty({ example: 'd5147b61-90d2-4b19-a987-c32e5e47e220' })
  @IsString()
  userId: string;

  @ApiProperty({ example: 'cm8vsfvyx0001wce8b40bhum2' })
  @IsString()
  cardId: string;

  @ApiProperty({ example: 2 })
  @IsNumber()
  month: number;

  @ApiProperty({ example: 2025 })
  @IsNumber()
  year: number;

  @ApiProperty({ example: '2500.75', type: String })
  totalAmount: Decimal;

  @ApiProperty({ example: '500.00', type: String })
  paidAmount: Decimal;

  @ApiProperty({ example: '2025-03-25T00:00:00.000Z' })
  @IsDate()
  dueDate: Date;

  @ApiProperty({ enum: InvoiceStatusDto, example: InvoiceStatusDto.PENDING })
  @IsEnum(InvoiceStatusDto)
  status: InvoiceStatusDto;

  @ApiProperty({ example: '2025-03-29T22:41:58.909Z' })
  @IsDate()
  createdAt: Date;

  @ApiProperty({ example: '2025-03-29T22:41:58.909Z', nullable: true })
  @IsOptional()
  @IsDate()
  editedAt: Date | null;
}

export class ResultFindAllInvoiceDto extends ResponseWithDataDto {
  @ApiProperty({
    example: resultSearchInvoices,
  })
  result: InvoiceDto[];

  @ApiProperty({
    example: 3,
  })
  count: number;
}
const resultUpdateAllInvoice = ['cm8vwsv9n0001wcygpvwrwa1t', 'cm8vx2ks40001wcj09dt6hmlr'];

export class ResultUpdateAllInvoicesDto extends ResponseWithDataDto {
  @ApiProperty({
    example: resultUpdateAllInvoice,
  })
  result: any;

  @ApiProperty({
    example: 2,
  })
  count: number;

  @ApiProperty({
    example: 201,
  })
  statusCode: HttpStatus;
}

// ======== NEW DTOs FOR FILTERING AND UPDATES ========

export class FindAllInvoicesDto extends PaginationDto {
  @ApiProperty({ example: 'cm8vsfvyx0001wce8b40bhum2', required: false, description: 'Filter by card ID' })
  @IsOptional()
  @IsString()
  cardId?: string;

  @ApiProperty({ example: 2, required: false, description: 'Filter by month (1-12)' })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  month?: number;

  @ApiProperty({ example: 2025, required: false, description: 'Filter by year' })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  year?: number;

  @ApiProperty({
    enum: InvoiceStatusDto,
    example: InvoiceStatusDto.PENDING,
    required: false,
    description: 'Filter by invoice status',
  })
  @IsOptional()
  @IsEnum(InvoiceStatusDto)
  status?: InvoiceStatusDto;
}

export class FindOneInvoiceDto {
  @ApiProperty({ example: 'a1b2c3d4-5678-90ab-cdef-1234567890ab', required: false })
  @IsOptional()
  @IsString()
  id?: string;

  @ApiProperty({ example: 'cm8vsfvyx0001wce8b40bhum2', required: false })
  @IsOptional()
  @IsString()
  cardId?: string;

  @ApiProperty({ example: 2, required: false })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  month?: number;

  @ApiProperty({ example: 2025, required: false })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  year?: number;
}

export class UpdateInvoiceDto {
  @ApiProperty({ example: '1500.00', required: false, description: 'Amount paid towards invoice' })
  @IsOptional()
  @IsString()
  paidAmount?: string;

  @ApiProperty({
    enum: InvoiceStatusDto,
    example: InvoiceStatusDto.PAID,
    required: false,
    description: 'Invoice status',
  })
  @IsOptional()
  @IsEnum(InvoiceStatusDto)
  status?: InvoiceStatusDto;
}

export class MarkInvoiceAsPaidDto {
  @ApiProperty({ example: '2500.75', required: false, description: 'Amount paid (defaults to totalAmount)' })
  @IsOptional()
  @IsString()
  paidAmount?: string;
}

export class ForecastInvoicesDto {
  @ApiProperty({ example: 3, description: 'Number of months to forecast ahead' })
  @IsNumber()
  @Type(() => Number)
  months: number;

  @ApiProperty({ example: 'cm8vsfvyx0001wce8b40bhum2', required: false, description: 'Filter by card ID' })
  @IsOptional()
  @IsString()
  cardId?: string;
}

export class ResultFindOneInvoiceDto extends ResponseWithDataDto {
  @ApiProperty({
    example: resultSearchInvoices[0],
  })
  result: InvoiceDto;
}

export class ResultUpdateInvoiceDto extends ResponseWithDataDto {
  @ApiProperty({
    example: resultSearchInvoices[0],
  })
  result: InvoiceDto;
}

export class ResultMarkAsPaidDto extends ResponseWithDataDto {
  @ApiProperty({
    example: resultSearchInvoices[1],
  })
  result: InvoiceDto;
}
