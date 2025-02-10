import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { createClient } from '@supabase/supabase-js';
import { SIGN_OPTIONS } from 'src/constants';
import { encryptValue } from 'utils/crypto';

@Injectable()
export class AuthService {
  private supabase = createClient(process.env.SUPABASE_URL || '', process.env.SUPABASE_ANON_KEY || '');

  constructor(private jwtService: JwtService) {}

  async register(email: string, password: string, name: string) {
    const { data, error } = await this.supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }

    const { error: dbError } = await this.supabase.from('User').insert([{ id: data.user?.id, email, name }]);

    if (dbError) {
      if (dbError.message.includes('duplicate key value violates unique constraint')) {
        throw new HttpException('This email is already registered!', HttpStatus.BAD_REQUEST);
      }
      throw new HttpException(dbError.details, HttpStatus.INTERNAL_SERVER_ERROR);
    }

    const payload = { sub: data.user?.id, email };
    const token = this.jwtService.sign(payload, SIGN_OPTIONS);

    return { email, name, token };
  }

  async login(email: string, password: string) {
    const { data, error } = await this.supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw new Error(error.message);

    const payload = { sub: data.user.id, email: data.user.email };
    const token = this.jwtService.sign(payload, SIGN_OPTIONS);

    // Criptografando o refresh_token
    const refreshTokenEncrypted = await encryptValue(data.session?.refresh_token);

    // Criptografando o access_token
    const accessTokenEncrypted = await encryptValue(data.session?.access_token);

    // Salvando o refresh_token criptografado no banco de dados
    await this.supabase.from('User').upsert([
      {
        id: data.user?.id,
        refresh_token: refreshTokenEncrypted,
        access_token: accessTokenEncrypted,
      },
    ]);

    return { token, refreshToken: data.session?.refresh_token };
  }
}
