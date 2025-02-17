import { User as PrismaUser } from '@prisma/client';
import { User as SupabaseUser } from '@supabase/supabase-js';
import { Request } from 'express';

export interface RequestWithUser extends Request {
  user: SupabaseUser & { userRole: PrismaUser['role'] };
}
