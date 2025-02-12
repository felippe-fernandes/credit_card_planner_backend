import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { LoginDto, SignupDto } from './dto/auth.dto';
import { supabase } from './supabase.client';

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService) {}

  async signUp(payload: SignupDto) {
    const { email, password, name, phone } = payload;

    try {
      const newUser = await this.prisma.user.create({
        data: {
          email,
          name,
          phone,
          categories: {
            create: [
              { name: 'Food', icon: '🍔', color: '#FF5733' },
              { name: 'Transport', icon: '🚗', color: '#3498DB' },
              { name: 'Entertainment', icon: '🎉', color: '#9B59B6' },
              { name: 'Health', icon: '💊', color: '#2ECC71' },
              { name: 'Education', icon: '📚', color: '#F1C40F' },
            ],
          },
        },
      });

      const { error } = await supabase.auth.signUp({
        email,
        password,
        phone,
        options: {
          data: { displayName: name, phone },
        },
      });

      if (error) {
        await this.prisma.user.delete({ where: { id: newUser.id } });
        throw new HttpException(`Error signing up: ${error.message}`, HttpStatus.BAD_REQUEST);
      }
      return {
        message: 'User successfully created',
        user: newUser,
      };
    } catch {
      throw new HttpException('Error saving user to the database', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async signIn(payload: LoginDto) {
    const { email, password } = payload;

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      throw new HttpException(`Login failed: ${error.message}`, HttpStatus.UNAUTHORIZED);
    }

    if (!data.session) {
      throw new HttpException('Invalid session', HttpStatus.UNAUTHORIZED);
    }

    return {
      message: 'Login successful',
      session: data.session,
    };
  }

  async signOut() {
    const { error } = await supabase.auth.signOut();

    if (error) {
      throw new HttpException(`Error logging out: ${error.message}`, HttpStatus.BAD_REQUEST);
    }

    return { message: 'Logout successful' };
  }
}
