import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { createClient } from '@supabase/supabase-js';

@Injectable()
export class AuthService {
  private supabase = createClient(
    process.env.SUPABASE_URL || '',
    process.env.SUPABASE_ANON_KEY || '',
  );

  constructor(private jwtService: JwtService) {}

  async register(email: string, password: string, name: string) {
    // Criar usuário no Supabase
    const { data, error } = await this.supabase.auth.signUp({
      email,
      password,
    });

    if (error) throw new Error(error.message);

    // const { error: dbError } = await this.supabase
    //   .from('User')
    //   .insert([{ id: data.user?.id, email, name }]);

    // if (dbError) throw new Error(dbError.details);

    // Retornar usuário criado
    return data;
  }

  async login(email: string, password: string) {
    const { data, error } = await this.supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw new Error(error.message);

    // Gerar JWT
    const payload = { sub: data.user.id, email: data.user.email };
    const token = this.jwtService.sign(payload);

    return { token };
  }
}
