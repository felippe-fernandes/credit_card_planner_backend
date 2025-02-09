import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { CardModule } from './card/card.module';
import { PrismaService } from './prisma/prisma.service';

@Module({
  imports: [ConfigModule.forRoot(), AuthModule, CardModule],
  providers: [PrismaService],
  exports: [PrismaService],
})
export class AppModule {}
