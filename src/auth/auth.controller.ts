import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto, SignupDto } from './dto/auth.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  async signUp(@Body() body: SignupDto) {
    return await this.authService.signUp(body);
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
