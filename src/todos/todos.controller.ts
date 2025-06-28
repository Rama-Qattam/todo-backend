/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Patch,
  UseGuards,
  Request,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateTodoDto } from './dto/create-todo.dto';
import { UpdateTodoDto } from './dto/update-todo.dto';
import { TodosService } from './todos.service';

@UseGuards(JwtAuthGuard)
@Controller('todos')
export class TodosController {
  constructor(private readonly todosService: TodosService) {}

  @Get()
  async findAll(@Request() req: { user: { userId: string } }) {
    return this.todosService.findByOwner(req.user.userId);
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Request() req) {
    const todo = await this.todosService.findOneById(id);
    if (!todo) throw new NotFoundException('Todo not found');
    if (todo.owner.toString() !== req.user.userId)
      throw new ForbiddenException('Not your todo');
    return todo;
  }

  @Post()
  async create(@Body() createTodoDto: CreateTodoDto, @Request() req) {
    return this.todosService.create({
      ...createTodoDto,
      owner: req.user.userId,
    });
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateTodoDto: UpdateTodoDto,
    @Request() req,
  ) {
    const todo = await this.todosService.findOneById(id);
    if (!todo) throw new NotFoundException('Todo not found');
    if (todo.owner.toString() !== req.user.userId)
      throw new ForbiddenException('Not your todo');
    return this.todosService.update(id, updateTodoDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @Request() req) {
    const todo = await this.todosService.findOneById(id);
    if (!todo) throw new NotFoundException('Todo not found');
    if (todo.owner.toString() !== req.user.userId)
      throw new ForbiddenException('Not your todo');
    return this.todosService.remove(id);
  }
}
