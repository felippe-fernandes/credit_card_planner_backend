import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { CardsModule } from './cards/cards.module';
import { PrismaModule } from './prisma/prisma.module';
import { UserModule } from './user/user.module';

@Module({
  imports: [ConfigModule.forRoot(), PrismaModule, AuthModule, UserModule, CardsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
