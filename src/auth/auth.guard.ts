import { CanActivate, ExecutionContext, HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { RequestWithUser } from './interfaces/auth.interface';
import { supabase } from './supabase.client';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<RequestWithUser>();

    // 🔁 Agora pega o token do cookie
    const token = request.cookies.sb_auth_token as string | undefined;

    if (!token) {
      throw new HttpException('Authorization token is required', HttpStatus.UNAUTHORIZED);
    }

    const { data: supabaseUserData, error: supabaseUserError } = await supabase.auth.getUser(token);

    if (supabaseUserError || !supabaseUserData.user) {
      throw new HttpException('Invalid or expired token', HttpStatus.UNAUTHORIZED);
    }

    const prismaUser = await this.prisma.user.findUnique({
      where: { id: supabaseUserData.user.id },
    });

    if (!prismaUser) {
      throw new HttpException('User not found in the database', HttpStatus.NOT_FOUND);
    }

    request.user = { ...supabaseUserData.user, userRole: prismaUser.role };

    return true;
  }
}
