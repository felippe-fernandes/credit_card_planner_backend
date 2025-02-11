import { Body, Controller, Delete, Get, Patch, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from 'src/auth/auth.guard';
import { RequestWithUser } from 'src/auth/interfaces/auth.interface';
import { UpdateUserDto } from './dto/user.dto';
import { UserService } from './user.service';

@Controller('users')
@UseGuards(AuthGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('me')
  findMe(@Req() req: RequestWithUser) {
    return this.userService.findOne(req.user.id);
  }

  @Patch('me')
  update(@Req() req: RequestWithUser, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.update(req.user.id, updateUserDto);
  }

  @Delete('me')
  remove(@Req() req: RequestWithUser) {
    return this.userService.remove(req.user.id);
  }
}
