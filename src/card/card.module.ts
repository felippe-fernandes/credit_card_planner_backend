import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module'; // Importe o módulo de autenticação

@Module({
  imports: [AuthModule], // Agora o JwtService estará disponível
})
export class CardModule {}
