import { Body, Controller, Post, Req, Res, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { AuthService } from './auth.service';
import { LoginDto, SignupDto } from './dto/auth.dto';
import { RequestWithUser } from './interfaces/auth.interface';
import { Roles } from './roles/roles.decorator';
import { RolesGuard } from './roles/roles.guard';

@ApiTags('Authentication')
@Controller('auth')
@UseGuards(RolesGuard)
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup/user')
  @ApiOperation({ summary: 'Create a new user' })
  @ApiResponse({ status: 201, description: 'User created successfully.' })
  @ApiResponse({ status: 400, description: 'Error signing up.' })
  @ApiResponse({ status: 500, description: 'Error retrieving user from Supabase.' })
  async signUpUser(@Body() body: SignupDto) {
    return await this.authService.signUpUser(body);
  }

  @Post('signup/admin')
  @Roles('SUPER_ADMIN')
  @ApiOperation({ summary: 'Create a new admin' })
  @ApiResponse({ status: 201, description: 'Admin created successfully.' })
  @ApiResponse({ status: 400, description: 'Error signing up.' })
  @ApiResponse({ status: 500, description: 'Error retrieving user from Supabase.' })
  async signUpAdmin(@Req() req: RequestWithUser, @Body() body: SignupDto) {
    return await this.authService.signUpAdmin(body);
  }

  @Post('signup/super-admin')
  @Roles('SUPER_ADMIN')
  @ApiOperation({ summary: 'Create a new super admin' })
  @ApiResponse({ status: 201, description: 'Super admin created successfully.' })
  @ApiResponse({ status: 400, description: 'Error signing up.' })
  @ApiResponse({ status: 500, description: 'Error retrieving user from Supabase.' })
  async signUpSuperAdmin(@Body() body: SignupDto) {
    return await this.authService.signUpSuperAdmin(body);
  }

  @Post('login')
  @ApiOperation({ summary: 'Login a user' })
  @ApiResponse({ status: 200, description: 'User logged in successfully.' })
  @ApiResponse({ status: 400, description: 'Error logging in.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 500, description: 'Error retrieving user from Supabase.' })
  async signIn(@Body() body: LoginDto, @Res({ passthrough: true }) response: Response) {
    return await this.authService.signIn(body, response);
  }

  @Post('signout')
  @ApiOperation({ summary: 'Login a user' })
  @ApiResponse({ status: 200, description: 'User logged out successfully.' })
  @ApiResponse({ status: 400, description: 'Error signing out.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 500, description: 'Error retrieving user from Supabase.' })
  async signOut(@Req() req: RequestWithUser, @Res({ passthrough: true }) response: Response) {
    const userId = req.user.id;
    return await this.authService.signOut(userId, response);
  }
}
