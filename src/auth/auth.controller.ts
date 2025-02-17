import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
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
  async signIn(@Body() body: LoginDto) {
    return await this.authService.signIn(body);
  }

  @Post('signout')
  async signOut() {
    return await this.authService.signOut();
  }
}
