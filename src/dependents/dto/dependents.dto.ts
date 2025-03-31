import { HttpStatus } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import { Dependent } from '@prisma/client';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ResponseWithDataDto } from 'src/constants';

export class CreateDependentDto {
  @ApiProperty({
    example: 'John Doe',
  })
  @IsNotEmpty()
  @IsString()
  name: string;
}

export class UpdateDependentDto {
  @ApiProperty({
    example: 'John Doe',
  })
  @IsNotEmpty()
  @IsString()
  @IsOptional()
  name: string;
}

export class FindAllDependentsDto {
  @IsOptional()
  @IsString()
  dependentId?: string;

  @IsOptional()
  @IsString()
  name?: string;
}

export class FindOneDependentDto {
  @IsString()
  @IsOptional()
  id?: string;

  @IsString()
  @IsOptional()
  name?: string;
}

const resultSearchDependent = [
  {
    id: 'a1b2c3d4-5678-90ab-cdef-1234567890ab',
    userId: 'd5147b61-90d2-4b19-a987-c32e5e47e220',
    name: 'John Doe',
    createdAt: '2025-03-30T10:15:30.123Z',
    editedAt: '2025-03-30T10:15:30.123Z',
  },
  {
    id: 'f4e5d6c7-89ab-01cd-ef23-456789abcd12',
    userId: 'd5147b61-90d2-4b19-a987-c32e5e47e220',
    name: 'Emma Johnson',
    createdAt: '2025-03-30T11:20:45.456Z',
    editedAt: '2025-03-30T11:20:45.456Z',
  },
  {
    id: '98ab76cd-5432-1ef0-9abc-345678def901',
    userId: 'd5147b61-90d2-4b19-a987-c32e5e47e220',
    name: 'Michael Williams',
    createdAt: '2025-03-30T12:35:20.789Z',
    editedAt: '2025-03-30T12:35:20.789Z',
  },
];

export class ResultFindAllDependentDto extends ResponseWithDataDto {
  @ApiProperty({
    example: resultSearchDependent,
  })
  result: Dependent[];

  @ApiProperty({
    example: 3,
  })
  count: number;
}

export class ResultFindOneDependentDto extends ResponseWithDataDto {
  @ApiProperty({
    example: resultSearchDependent[0],
  })
  result: Dependent;

  @ApiProperty({
    example: 1,
  })
  count: number;
}

const resultCreateDependent = {
  id: '98ab76cd-5432-1ef0-9abc-345678def901',
  userId: 'd5147b61-90d2-4b19-a987-c32e5e47e220',
  name: 'Michael Williams',
  createdAt: '2025-03-30T12:35:20.789Z',
  editedAt: '2025-03-30T12:35:20.789Z',
};

export class ResultCreateDependentDto extends ResponseWithDataDto {
  @ApiProperty({
    example: resultCreateDependent,
  })
  data: any;

  @ApiProperty({
    example: 1,
  })
  count: number;

  @ApiProperty({
    example: 201,
  })
  statusCode: HttpStatus;
}

export class ResultUpdateDependentDto extends ResponseWithDataDto {
  @ApiProperty({
    example: resultCreateDependent,
  })
  data: any;

  @ApiProperty({
    example: 1,
  })
  count: number;

  @ApiProperty({
    example: 200,
  })
  statusCode: HttpStatus;
}

export class ResultDeleteDependentDto extends ResponseWithDataDto {
  @ApiProperty({
    example: { dependentId: 'mb1231xcaasd1234da' },
  })
  data: any;

  @ApiProperty({
    example: 1,
  })
  count: number;

  @ApiProperty({
    example: 200,
  })
  statusCode: HttpStatus;
}
