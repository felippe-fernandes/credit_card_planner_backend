import { HttpStatus } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import { Category } from '@prisma/client';
import { IsHexColor, IsOptional, IsString } from 'class-validator';
import { ResponseWithDataDto } from 'src/constants';

export class CreateCategoryDto {
  @ApiProperty({
    example: 'Groceries',
  })
  @IsString()
  name: string;

  @ApiProperty({
    example: '🛒',
  })
  @IsOptional()
  @IsString()
  icon?: string;

  @ApiProperty({
    example: '#E97E63',
  })
  @IsOptional()
  @IsString()
  @IsHexColor()
  color?: string;
}

export class UpdateCategoryDto {
  @ApiProperty({
    example: 'Groceries',
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({
    example: '🛒',
  })
  @IsOptional()
  @IsString()
  icon?: string;

  @ApiProperty({
    example: '#E97E63',
  })
  @IsOptional()
  @IsString()
  @IsHexColor()
  color?: string;
}

export class FindAllCategoryDto {
  @IsOptional()
  @IsString()
  id?: string;

  @IsOptional()
  @IsString()
  name?: string;
}

export class FindOneCategoryDto {
  @IsOptional()
  @IsString()
  name?: string;
}

const resultSearchCategory = [
  {
    name: 'Shopping',
    icon: '🛍️',
    color: '#E91E63',
    userId: 'a1b2c3d4-5678-9101-1121-314151617181',
    createdAt: '2025-03-30T10:15:20.000Z',
    editedAt: '2025-03-30T10:15:20.000Z',
  },
  {
    name: 'Bills',
    icon: '💡',
    color: '#FFC107',
    userId: 'a1b2c3d4-5678-9101-1121-314151617181',
    createdAt: '2025-03-30T11:20:30.000Z',
    editedAt: '2025-03-30T11:20:30.000Z',
  },
  {
    name: 'Travel',
    icon: '✈️',
    color: '#2196F3',
    userId: 'a1b2c3d4-5678-9101-1121-314151617181',
    createdAt: '2025-03-30T12:25:40.000Z',
    editedAt: '2025-03-30T12:25:40.000Z',
  },
];

export class ResultFindAllCategoryDto extends ResponseWithDataDto {
  @ApiProperty({
    example: resultSearchCategory,
  })
  result: Category[];

  @ApiProperty({
    example: 3,
  })
  count: number;
}

export class ResultFindOneCategoryDto extends ResponseWithDataDto {
  @ApiProperty({
    example: resultSearchCategory[0],
  })
  result: Category;

  @ApiProperty({
    example: 1,
  })
  count: number;
}

const resultCreateCategory = {
  name: 'Food',
  icon: '🍔',
  color: '#FF5733',
  userId: 'd5147b61-90d2-4b19-a987-c32e5e47e220',
  createdAt: '2025-03-29T22:41:58.909Z',
  editedAt: '2025-03-29T22:41:58.909Z',
};

export class ResultCreateCategoryDto extends ResponseWithDataDto {
  @ApiProperty({
    example: resultCreateCategory,
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

export class ResultUpdateCategoryDto extends ResponseWithDataDto {
  @ApiProperty({
    example: resultCreateCategory,
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

export class ResultDeleteCategoryDto extends ResponseWithDataDto {
  @ApiProperty({
    example: { category: 'mb1231xcaasd1234da' },
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
