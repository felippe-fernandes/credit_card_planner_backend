import { Body, Controller, Get, Post, Req, Res, UseGuards } from '@nestjs/common';
import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { LoginDto, SignupDto } from './dto/auth.dto';
import { RequestWithUser } from './interfaces/auth.interface';
import { Roles } from './roles/roles.decorator';
import { RolesGuard } from './roles/roles.guard';

@Controller('auth')
@UseGuards(RolesGuard)
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup/user')
  async signUpUser(@Body() body: SignupDto) {
    return await this.authService.signUpUser(body);
  }

  @Post('signup/admin')
  @Roles('SUPER_ADMIN')
  async signUpAdmin(@Req() req: RequestWithUser, @Body() body: SignupDto) {
    return await this.authService.signUpAdmin(body);
  }

  @Post('signup/super-admin')
  @Roles('SUPER_ADMIN')
  async signUpSuperAdmin(@Req() req: RequestWithUser, @Body() body: SignupDto) {
    return await this.authService.signUpSuperAdmin(body);
  }

  @Post('login')
  async signIn(@Body() body: LoginDto, @Res({ passthrough: true }) response: Response) {
    return await this.authService.signIn(body, response);
  }

  @Get('check-auth')
  checkAuth(@Req() req: Request) {
    return this.authService.check(req);
  }

  @Post('signout')
  async signOut() {
    return await this.authService.signOut();
  }
}
