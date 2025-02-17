import { Body, Controller, Delete, Get, Patch, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from 'src/auth/auth.guard';
import { RequestWithUser } from 'src/auth/interfaces/auth.interface';
import { Roles } from 'src/auth/roles/roles.decorator';
import { RolesGuard } from 'src/auth/roles/roles.guard';
import { UpdateUserDto, UpdateUserRoleDto } from './dto/user.dto';
import { UserService } from './user.service';

@Controller('users')
@UseGuards(AuthGuard, RolesGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  @Roles('SUPER_ADMIN')
  findAll() {
    return this.userService.findAll();
  }

  @Get('me')
  findMe(@Req() req: RequestWithUser) {
    return this.userService.findOne(req.user.id);
  }

  @Patch('me')
  update(@Req() req: RequestWithUser, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.update(req.user.id, updateUserDto);
  }

  @Patch('change-role')
  @Roles('SUPER_ADMIN')
  updateRole(@Body() updateUserDto: UpdateUserRoleDto) {
    return this.userService.updateRole(updateUserDto);
  }

  @Delete('me')
  remove(@Req() req: RequestWithUser) {
    return this.userService.remove(req.user.id);
  }
}
