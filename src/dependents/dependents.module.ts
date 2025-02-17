import { Module } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { DependentsController } from './dependents.controller';
import { DependentsService } from './dependents.service';
@Module({
  controllers: [DependentsController],
  providers: [DependentsService, PrismaService],
})
export class DependentsModule {}
