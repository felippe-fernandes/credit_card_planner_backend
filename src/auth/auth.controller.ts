import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  async signUp(@Body() body: { email: string; password: string; name: string }) {
    const { email, password, name } = body;
    return await this.authService.signUp(email, password, name);
  }

  @Post('login')
  async signIn(@Body() body: { email: string; password: string }) {
    const { email, password } = body;
    return await this.authService.signIn(email, password);
  }

  @Post('signout')
  async signOut() {
    return await this.authService.signOut();
  }
}
