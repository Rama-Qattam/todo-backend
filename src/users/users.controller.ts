import {
  Body,
  Controller,
  Post,
  Get,
  Param,
  ParseIntPipe,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('register')
  async register(@Body() createUserDto: CreateUserDto) {
    return await this.usersService.create(createUserDto);
  }
  @Get('with-todos')
  getAllUsersWithTodos() {
    return this.usersService.findAllWithTodos();
  }

  @Get('with-todos/:id')
  getOneUserWithTodos(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.findOneWithTodos(id);
  }
}
