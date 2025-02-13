import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from '../prisma/prisma.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { CardsModule } from './cards/cards.module';
import { CategoriesController } from './categories/categories.controller';
import { CategoriesModule } from './categories/categories.module';
import { CategoriesService } from './categories/categories.service';
import { UserModule } from './user/user.module';
import { TransactionsController } from './transactions/transactions.controller';
import { TransactionsService } from './transactions/transactions.service';
import { TransactionsModule } from './transactions/transactions.module';

@Module({
  imports: [ConfigModule.forRoot(), PrismaModule, AuthModule, UserModule, CardsModule, CategoriesModule, TransactionsModule],
  controllers: [AppController, CategoriesController, TransactionsController],
  providers: [AppService, CategoriesService, TransactionsService],
})
export class AppModule {}
