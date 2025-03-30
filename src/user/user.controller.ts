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
import { ApiBearerAuth, ApiBody, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { Response } from 'express';
import { AuthGuard } from 'src/auth/auth.guard';
import { AuthService } from 'src/auth/auth.service';
import { RequestWithUser } from 'src/auth/interfaces/auth.interface';
import { Roles } from 'src/auth/roles/roles.decorator';
import { RolesGuard } from 'src/auth/roles/roles.guard';
import { UpdateUserDto, UpdateUserRoleDto } from './dto/user.dto';
import { UserService } from './user.service';

@ApiTags('Users')
@ApiBearerAuth()
@Controller('users')
@UseGuards(AuthGuard, RolesGuard)
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly authService: AuthService,
  ) {}

  @Get()
  @Roles('SUPER_ADMIN')
  @ApiOperation({ summary: 'Get all users' })
  @ApiResponse({ status: 200, description: 'Users retrieved successfully.' })
  @ApiResponse({ status: 404, description: 'No users found.' })
  findAll() {
    return this.userService.findAll();
  }

  @Get('me')
  @ApiOperation({ summary: 'Get current logged in user' })
  @ApiResponse({ status: 200, description: 'User retrieved successfully.' })
  @ApiResponse({ status: 404, description: 'User not found.' })
  findMe(@Req() req: RequestWithUser) {
    return this.userService.findOne(req.user.id);
  }

  @Patch('me')
  @ApiOperation({ summary: 'Update current logged in user' })
  @ApiBody({ type: UpdateUserDto })
  @ApiResponse({ status: 200, description: 'User updated successfully.' })
  @ApiResponse({ status: 400, description: 'Failed to update user.' })
  @ApiBody({ type: UpdateUserDto })
  update(@Req() req: RequestWithUser, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.update(req.user.id, updateUserDto);
  }

  @Put('change-role')
  @Roles('SUPER_ADMIN')
  @ApiOperation({ summary: "Change a user's role" })
  @ApiBody({ type: UpdateUserRoleDto })
  @ApiResponse({ status: 200, description: 'User role updated successfully.' })
  @ApiResponse({ status: 400, description: 'Error updating user role.' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        userId: { type: 'string' },
        newRole: { type: 'string', enum: Object.values(Role) },
      },
    },
  })
  updateRole(@Body() updateUserDto: UpdateUserRoleDto) {
    return this.userService.updateRole(updateUserDto);
  }

  @Delete('me')
  @ApiOperation({ summary: 'Delete current logged in user' })
  @ApiResponse({ status: 200, description: 'User deleted successfully.' })
  @ApiResponse({ status: 404, description: 'User not found.' })
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

  @Delete('delete/:id')
  @Roles('SUPER_ADMIN')
  @ApiOperation({ summary: 'Delete a user by ID' })
  @ApiParam({ name: 'userId', type: String, description: 'User ID' })
  @ApiResponse({ status: 200, description: 'User deleted successfully.' })
  @ApiResponse({ status: 400, description: 'Error deleting user.' })
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
}
