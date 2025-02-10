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
          'This email is already registered!',
          HttpStatus.BAD_REQUEST,
        );
      }
      throw new HttpException(
        dbError.details,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    const payload = { sub: data.user?.id, email };
    const token = this.jwtService.sign(payload, { expiresIn: '1d' });

    return { email, name, token };
  }

  async login(email: string, password: string) {
    const { data, error } = await this.supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw new HttpException(error.message, HttpStatus.BAD_REQUEST);

    const payload = { sub: data.user.id, email: data.user.email };
    const token = this.jwtService.sign(payload, { expiresIn: '1d' });

    return { token };
  }

  async changePassword(changePasswordDto: ChangePasswordDto) {
    const { newPassword } = changePasswordDto;

    // Verificar se o usuário existe
    const { data, error } = await this.supabase.auth.getUser();

    if (error || !data || !data.user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    const { error: updateError } = await this.supabase.auth.updateUser({
      password: newPassword,
      email: data.user.email!,
    });

    if (updateError) {
      throw new HttpException(
        'Error updating password',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    // Gerar novo token com o novo password
    const payload = { sub: '', email: data.user.email };
    const newToken = this.jwtService.sign(payload, { expiresIn: '1d' });

    return { message: 'Password updated successfully', token: newToken };
  }
}
