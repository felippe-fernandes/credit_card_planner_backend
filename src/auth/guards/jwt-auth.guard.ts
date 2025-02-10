import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  canActivate(context: ExecutionContext) {
    return super.canActivate(context);
  }

  handleRequest<RequestWithUser>(
    err: any,
    user: RequestWithUser,
  ): RequestWithUser {
    if (err || !user) {
      throw new UnauthorizedException('Invalid token');
    }
    return user as RequestWithUser;
  }
}
