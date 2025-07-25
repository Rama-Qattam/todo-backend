import {
  Body,
  Controller,
  Post,
  Get,
  Param,
  ParseIntPipe,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { Delete } from '@nestjs/common';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('with-todos')
  getAllUsersWithTodos() {
    return this.usersService.findAllWithTodos();
  }

  @Get('with-todos/:id')
  getOneUserWithTodos(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.findOneWithTodos(id);
  }
  @Post('reset-password')
  async resetPassword(
    @Body('token') token: string,
    @Body('password') password: string,
    @Body('confirmPassword') confirmPassword: string,
  ) {
    return this.usersService.resetPassword(token, password, confirmPassword);
  }
  @Delete(':id')
  async deleteUser(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.softDeleteUser(id);
  }
}
