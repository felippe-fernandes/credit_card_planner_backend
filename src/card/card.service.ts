import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateCardDto } from './dto/card.dto';

@Injectable()
export class CardService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, data: CreateCardDto) {
    return await this.prisma.card.create({
      data: {
        ...data,
        userId,
      },
    });
  }

  async findAll(userId: string) {
    return await this.prisma.card.findMany({
      where: { userId },
    });
  }

  async findOne(id: string, userId: string) {
    return await this.prisma.card.findFirst({
      where: { id, userId },
    });
  }

  async delete(id: string, userId: string) {
    return await this.prisma.card.deleteMany({
      where: { id, userId },
    });
  }
}
