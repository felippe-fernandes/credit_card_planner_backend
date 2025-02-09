import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { createClient } from '@supabase/supabase-js';
import { ChangePasswordDto } from './dto/change-password.dto';

@Injectable()
export class AuthService {
  private supabase = createClient(
    process.env.SUPABASE_URL || '',
    process.env.SUPABASE_ANON_KEY || '',
  );

  constructor(private jwtService: JwtService) {}

  async register(email: string, password: string, name: string) {
    const { data, error } = await this.supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }

    const { error: dbError } = await this.supabase
      .from('User')
      .insert([{ id: data.user?.id, email, name }]);

    if (dbError) {
      if (
        dbError.message.includes(
          'duplicate key value violates unique constraint',
        )
      ) {
        throw new HttpException(
          'Este email já está registrado!',
          HttpStatus.BAD_REQUEST,
        );
      }
      throw new HttpException(
        dbError.details,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    const payload = { sub: data.user?.id, email };
    const token = this.jwtService.sign(payload);

    return { email, name, token };
  }

  async login(email: string, password: string) {
    const { data, error } = await this.supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw new HttpException(error.message, HttpStatus.BAD_REQUEST);

    const payload = { sub: data.user.id, email: data.user.email };
    const token = this.jwtService.sign(payload);

    return { token };
  }

  async changePassword(userId: string, changePasswordDto: ChangePasswordDto) {
    const { currentPassword, newPassword } = changePasswordDto;

    // Verificar se o usuário existe
    const { data, error } = await this.supabase.auth.getUser(userId);

    if (error || !data || !data.user) {
      throw new HttpException('Usuário não encontrado', HttpStatus.NOT_FOUND);
    }

    // Tentar reautenticar o usuário com a senha atual
    const { error: authError } = await this.supabase.auth.signInWithPassword({
      email: data.user.email!,
      password: currentPassword,
    });

    if (authError) {
      throw new HttpException('Senha atual incorreta', HttpStatus.BAD_REQUEST);
    }

    // Atualizar a senha para a nova
    const { error: updateError } = await this.supabase.auth.updateUser({
      password: newPassword,
    });

    if (updateError) {
      throw new HttpException(
        'Erro ao atualizar a senha',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    return { message: 'Senha alterada com sucesso' };
  }
}
