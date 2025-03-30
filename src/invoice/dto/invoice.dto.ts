import { HttpStatus } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import { Invoice } from '@prisma/client';
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

export class ResultFindAllInvoiceDto extends ResponseWithDataDto {
  @ApiProperty({
    example: resultSearchInvoices,
  })
  result: Invoice[];

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
  data: any;

  @ApiProperty({
    example: 2,
  })
  count: number;

  @ApiProperty({
    example: 201,
  })
  statusCode: HttpStatus;
}
