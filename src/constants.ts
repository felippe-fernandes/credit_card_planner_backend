import { JwtSignOptions } from '@nestjs/jwt';

export const SIGN_OPTIONS: JwtSignOptions = {
  expiresIn: '7d',
  audience: process.env.SUPABASE_URL,
};
