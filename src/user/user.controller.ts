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
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiExcludeEndpoint,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { Response } from 'express';
import { AuthGuard } from 'src/auth/auth.guard';
import { AuthService } from 'src/auth/auth.service';
import { RequestWithUser } from 'src/auth/interfaces/auth.interface';
import { Roles } from 'src/auth/roles/roles.decorator';
import { RolesGuard } from 'src/auth/roles/roles.guard';
import { SortOrder } from 'src/common/dto/pagination.dto';
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
  @ApiOperation({ summary: 'Get all users', operationId: 'getAllUsers' })
  @ApiOkResponse({ type: ResultFindAllUsersDto })
  @ApiNotFoundResponse({ type: ResponseNotFoundDto })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number (default: 1)' })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Items per page (default: 10, max: 100)',
  })
  @ApiQuery({ name: 'sortBy', required: false, description: 'Field to sort by (default: createdAt)' })
  @ApiQuery({
    name: 'sortOrder',
    required: false,
    enum: ['asc', 'desc'],
    description: 'Sort order (default: desc)',
  })
  getAllUsers(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('sortBy') sortBy?: string,
    @Query('sortOrder') sortOrder?: 'asc' | 'desc',
  ) {
    const pageNumber = page ? parseInt(page, 10) : 1;
    const limitNumber = limit ? parseInt(limit, 10) : 10;
    return this.userService.findAll({
      page: pageNumber,
      limit: limitNumber,
      sortBy,
      sortOrder: sortOrder as SortOrder,
    });
  }

  @Put('change-role')
  @Roles('SUPER_ADMIN')
  @ApiOperation({ summary: "Change a user's role", operationId: 'changeUserRole' })
  @ApiBody({ type: UpdateUserRoleDto })
  @ApiOkResponse({ type: ResultUpdateUserRoleDto })
  @ApiExcludeEndpoint()
  changeUserRole(@Body() updateUserDto: UpdateUserRoleDto) {
    return this.userService.updateRole(updateUserDto);
  }

  @Delete('delete/:id')
  @Roles('SUPER_ADMIN')
  @ApiOperation({ summary: 'Delete a user by ID', operationId: 'deleteUserById' })
  @ApiOkResponse({ type: ResultDeleteUserDto })
  @ApiParam({ name: 'id', type: String, description: 'User ID' })
  async deleteUserById(@Param('id') userId: string, @Res({ passthrough: true }) response: Response) {
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
  @ApiOperation({ summary: 'Update a user by ID', operationId: 'updateUserById' })
  @ApiOkResponse({ type: ResultUpdateUserRoleDto })
  @ApiParam({ name: 'id', type: String, description: 'User ID' })
  async updateUserById(@Param('id') userId: string, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.update(userId, updateUserDto);
  }

  @Get('me')
  @ApiOperation({ summary: 'Get current logged in user', operationId: 'getCurrentUser' })
  @ApiOkResponse({ type: ResultFindOneUserDto })
  @ApiNotFoundResponse({ type: ResponseNotFoundDto })
  getCurrentUser(@Req() req: RequestWithUser) {
    return this.userService.findOne(req.user.id);
  }

  @Patch('me')
  @ApiOperation({ summary: 'Update current logged in user', operationId: 'updateCurrentUser' })
  @ApiBody({ type: UpdateUserDto })
  @ApiOkResponse({ type: ResultUpdateUserRoleDto })
  updateCurrentUser(@Req() req: RequestWithUser, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.update(req.user.id, updateUserDto);
  }

  @Delete('me')
  @ApiOperation({ summary: 'Delete current logged in user', operationId: 'deleteCurrentUser' })
  @ApiOkResponse({ type: ResultDeleteUserDto })
  async deleteCurrentUser(@Req() req: RequestWithUser, @Res() res: Response) {
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
