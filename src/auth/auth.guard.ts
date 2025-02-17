import { CanActivate, ExecutionContext, HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { RequestWithUser } from './interfaces/auth.interface';
import { supabase } from './supabase.client';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const authHeader = request.headers.authorization;

    if (!authHeader) {
      throw new HttpException('Authorization token is required', HttpStatus.UNAUTHORIZED);
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      throw new HttpException('Invalid authorization format', HttpStatus.UNAUTHORIZED);
    }

    const { data: supabaseUserData, error: supabaseUserError } = await supabase.auth.getUser(token);

    if (supabaseUserError || !supabaseUserData?.user) {
      throw new HttpException('Invalid or expired token', HttpStatus.UNAUTHORIZED);
    }

    const prismaUser = await this.prisma.user.findUnique({
      where: { id: supabaseUserData.user.id },
    });

    if (!prismaUser) {
      throw new HttpException('User not found in the database', HttpStatus.NOT_FOUND);
    }

    request.user = { ...supabaseUserData.user, userRole: prismaUser.role };

    if (prismaUser.role === 'SUPER_ADMIN') {
      return true;
    }

    return true;
  }
}
