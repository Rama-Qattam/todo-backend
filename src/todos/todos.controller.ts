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
import { TodoStatus } from './schemas/todo.schema';
import { JwtPayload } from '../auth/interfaces/jwt-payload.interface';
import { Request as ExpressRequest } from 'express';

interface AuthRequest extends ExpressRequest {
  user: JwtPayload;
}

@UseGuards(JwtAuthGuard)
@Controller('todos')
export class TodosController {
  constructor(private readonly todosService: TodosService) {}

  @Get()
  async findAll(@Request() req: AuthRequest) {
    const todos = await this.todosService.findByOwner(req.user.sub);
    if (!todos || todos.length === 0) {
      throw new NotFoundException('No data recorded');
    }
    return todos.map((todo) => ({
      id: todo._id,
      name: todo.name,
      description: todo.description,
      status: todo.status,
      dueDate: todo.dueDate,
      createdAt: todo.createdAt,
    }));
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Request() req: AuthRequest) {
    const todo = await this.todosService.findOneByCustomId(Number(id));
    if (!todo) throw new NotFoundException('Todo not found');
    if (todo.owner !== req.user.sub)
      throw new ForbiddenException('Not your todo');
    return {
      id: todo._id,
      name: todo.name,
      description: todo.description,
      status: todo.status,
      dueDate: todo.dueDate,
      createdAt: todo.createdAt,
    };
  }

  @Post()
  async create(
    @Body() createTodoDto: CreateTodoDto,
    @Request() req: AuthRequest,
  ) {
    console.log('typeof req.user.sub:', typeof req.user.sub, req.user.sub);
    return this.todosService.create({
      ...createTodoDto,
      owner: Number(req.user.sub),
    });
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateTodoDto: UpdateTodoDto,
    @Request() req: AuthRequest,
  ) {
    const todo = await this.todosService.findOneByCustomId(Number(id));
    if (!todo) throw new NotFoundException('Todo not found');
    if (todo.owner !== Number(req.user.sub))
      throw new ForbiddenException('Not your todo');
    return this.todosService.update(Number(id), updateTodoDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @Request() req: AuthRequest) {
    const todo = await this.todosService.findOneByCustomId(Number(id));
    if (!todo) throw new NotFoundException('Todo not found');
    if (todo.owner !== Number(req.user.sub))
      throw new ForbiddenException('Not your todo');
    return this.todosService.remove(Number(id));
  }

  @Patch(':id/status')
  async setStatus(
    @Param('id') id: string,
    @Body('status') status: TodoStatus,
    @Request() req: AuthRequest,
  ) {
    const todo = await this.todosService.findOneByCustomId(Number(id));
    if (!todo) throw new NotFoundException('Todo not found');
    if (todo.owner !== Number(req.user.sub))
      throw new ForbiddenException('Not your todo');
    return this.todosService.setStatus(Number(id), status);
  }
}
