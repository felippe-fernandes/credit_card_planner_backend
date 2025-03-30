import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  Patch,
  Put,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { Response } from 'express';
import { AuthGuard } from 'src/auth/auth.guard';
import { AuthService } from 'src/auth/auth.service';
import { RequestWithUser } from 'src/auth/interfaces/auth.interface';
import { Roles } from 'src/auth/roles/roles.decorator';
import { RolesGuard } from 'src/auth/roles/roles.guard';
import { ResponseNotFoundDto } from 'src/constants';
import { ApiErrorDefaultResponses } from 'src/decorators/api-error-default-response.decorators';
import {
  ResultDeleteUserDto,
  ResultFindAllUsersDto,
  ResultFindOneUserDto,
  ResultUpdateUserRoleDto,
  UpdateUserDto,
  UpdateUserRoleDto,
} from './dto/user.dto';
import { UserService } from './user.service';

@ApiTags('Users')
@ApiBearerAuth()
@Controller('users')
@ApiErrorDefaultResponses()
@UseGuards(AuthGuard, RolesGuard)
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly authService: AuthService,
  ) {}

  @Get()
  @Roles('SUPER_ADMIN')
  @ApiOperation({ summary: 'Get all users' })
  @ApiOkResponse({ type: ResultFindAllUsersDto })
  @ApiNotFoundResponse({ type: ResponseNotFoundDto })
  findAll() {
    return this.userService.findAll();
  }

  @Put('change-role')
  @Roles('SUPER_ADMIN')
  @ApiOperation({ summary: "Change a user's role" })
  @ApiBody({ type: UpdateUserRoleDto })
  @ApiOkResponse({ type: ResultUpdateUserRoleDto })
  updateRole(@Body() updateUserDto: UpdateUserRoleDto) {
    return this.userService.updateRole(updateUserDto);
  }

  @Delete('delete/:id')
  @Roles('SUPER_ADMIN')
  @ApiOperation({ summary: 'Delete a user by ID' })
  @ApiOkResponse({ type: ResultDeleteUserDto })
  @ApiParam({ name: 'userId', type: String, description: 'User ID' })
  async deleteUser(@Param('userId') userId: string, @Res({ passthrough: true }) response: Response) {
    try {
      await this.authService.deleteUser(userId, response);
      return this.userService.remove(userId);
    } catch (error) {
      console.error('Error deleting user:', error);
      throw new BadRequestException({
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Error deleting user',
      });
    }
  }

  @Patch('edit/:id')
  @Roles('SUPER_ADMIN')
  @ApiOperation({ summary: 'Update a user by ID' })
  @ApiOkResponse({ type: ResultUpdateUserRoleDto })
  @ApiParam({ name: 'userId', type: String, description: 'User ID' })
  async updateUser(@Param('userId') userId: string, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.update(userId, updateUserDto);
  }

  @Get('me')
  @ApiOperation({ summary: 'Get current logged in user' })
  @ApiOkResponse({ type: ResultFindOneUserDto })
  @ApiNotFoundResponse({ type: ResponseNotFoundDto })
  findMe(@Req() req: RequestWithUser) {
    return this.userService.findOne(req.user.id);
  }

  @Patch('me')
  @ApiOperation({ summary: 'Update current logged in user' })
  @ApiBody({ type: UpdateUserDto })
  @ApiOkResponse({ type: ResultUpdateUserRoleDto })
  @ApiBody({ type: UpdateUserDto })
  update(@Req() req: RequestWithUser, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.update(req.user.id, updateUserDto);
  }

  @Delete('me')
  @ApiOperation({ summary: 'Delete current logged in user' })
  @ApiOkResponse({ type: ResultDeleteUserDto })
  async remove(@Req() req: RequestWithUser, @Res() res: Response) {
    const userId = req.user.id;
    try {
      await this.authService.deleteUser(userId, res);
      return this.userService.remove(userId);
    } catch (error) {
      console.error('Error deleting user:', error);
      throw new BadRequestException({
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Error deleting user',
      });
    }
  }
}
