// src/auth/auth.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { supabase } from './supabase.client'; // Importa o cliente do Supabase

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService) {}

  async signUp(email: string, password: string, name: string) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });
    if (error) {
      throw new Error(`Error signing up: ${error.message}`);
    }

    const user = data.user;
    if (!user) {
      throw new Error('User not found');
    }

    const newUser = await this.prisma.user.create({
      data: {
        id: user.id,
        email,
        name,
      },
    });

    return {
      message: 'User created successfully',
      user: newUser,
    };
  }

  // Função para login do usuário
  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      throw new Error(error.message);
    }

    return data.session;
  }

  async signOut() {
    const { error } = await supabase.auth.signOut();

    if (error) {
      throw new Error(error.message);
    }

    return { message: 'Logout successful' };
  }
}
