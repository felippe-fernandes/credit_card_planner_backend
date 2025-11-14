import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaService } from 'prisma/prisma.service';
import { RequestWithUser } from '../interfaces/auth.interface';
import { supabase } from '../supabase.client';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.get<string[]>('roles', context.getHandler());

    if (!requiredRoles) {
      return true;
    }

    const request = context.switchToHttp().getRequest<RequestWithUser>();

    // Use cookie instead of Authorization header (consistent with AuthGuard)
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

    const user = { ...supabaseUserData.user, userRole: prismaUser.role };

    if (!user.userRole) {
      throw new HttpException('User role not found', HttpStatus.UNAUTHORIZED);
    }

    if (user.userRole === 'SUPER_ADMIN') {
      return true;
    }

    if (!requiredRoles.includes(user.userRole)) {
      throw new ForbiddenException(`Access denied: You don't have access to this request`);
    }

    return true;
  }
}
