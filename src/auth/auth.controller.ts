import { Body, Controller, Post, Req, Res, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiExcludeEndpoint,
  ApiInternalServerErrorResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { Response } from 'express';
import { ResponseCreatedDto, ResponseInternalServerErrorDto } from 'src/constants';
import { ApiErrorDefaultResponses } from 'src/decorators/api-error-default-response.decorators';
import { AuthService } from './auth.service';
import { LoginDto, ResultLoginDto, ResultSignupDto, SignupDto } from './dto/auth.dto';
import { RequestWithUser } from './interfaces/auth.interface';
import { Roles } from './roles/roles.decorator';
import { RolesGuard } from './roles/roles.guard';

@Controller('auth')
@ApiTags('Authentication')
@ApiErrorDefaultResponses()
@ApiInternalServerErrorResponse({ type: ResponseInternalServerErrorDto })
@UseGuards(RolesGuard)
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @ApiOperation({ summary: 'Login a user' })
  @ApiOkResponse({ type: ResultLoginDto })
  async signIn(@Body() body: LoginDto, @Res({ passthrough: true }) response: Response) {
    return await this.authService.signIn(body, response);
  }

  @Post('signout')
  @ApiOperation({ summary: 'Logout a user' })
  @ApiCreatedResponse({ type: ResponseCreatedDto })
  async signOut(@Req() req: RequestWithUser, @Res({ passthrough: true }) response: Response) {
    return await this.authService.signOut(response);
  }

  @Post('signup')
  @ApiOperation({ summary: 'Create a new user' })
  @ApiCreatedResponse({ type: ResultSignupDto })
  @ApiExcludeEndpoint()
  async signUpUser(@Body() body: SignupDto) {
    return await this.authService.signUpUser(body);
  }

  @Post('signup/admin')
  @ApiBearerAuth()
  @Roles('SUPER_ADMIN')
  @ApiOperation({ summary: 'Create a new admin' })
  @ApiCreatedResponse({ type: ResultSignupDto })
  @ApiExcludeEndpoint()
  async signUpAdmin(@Req() req: RequestWithUser, @Body() body: SignupDto) {
    return await this.authService.signUpAdmin(body);
  }

  @Post('signup/super-admin')
  @ApiBearerAuth()
  @Roles('SUPER_ADMIN')
  @ApiOperation({ summary: 'Create a new super admin' })
  @ApiCreatedResponse({ type: ResultSignupDto })
  @ApiExcludeEndpoint()
  async signUpSuperAdmin(@Body() body: SignupDto) {
    return await this.authService.signUpSuperAdmin(body);
  }
}
