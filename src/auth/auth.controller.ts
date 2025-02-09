import {
  Body,
  Controller,
  Patch,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common'; // Importando corretamente o Request
import { AuthService } from './auth.service';
import { ChangePasswordDto } from './dto/change-password.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  register(@Body() body: { email: string; password: string; name: string }) {
    return this.authService.register(body.email, body.password, body.name);
  }

  @Post('login')
  login(@Body() body: { email: string; password: string }) {
    return this.authService.login(body.email, body.password);
  }

  @Patch('change-password')
  @UseGuards(JwtAuthGuard)
  async changePassword(
    @Request() req: { user: { id: string } },
    @Body() changePasswordDto: ChangePasswordDto,
  ) {
    const userId: string = req.user.id; // Garantir que user.id seja tratado como string
    return await this.authService.changePassword(userId, changePasswordDto);
  }
}
