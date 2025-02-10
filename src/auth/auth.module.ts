import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { SIGN_OPTIONS } from 'src/constants';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: SIGN_OPTIONS,
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService],
  exports: [AuthService, JwtModule],
})
export class AuthModule {}
