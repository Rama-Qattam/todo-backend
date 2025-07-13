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
  BadRequestException,
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
  @Post()
  async create(
    @Body() createTodoDto: CreateTodoDto,
    @Request() req: AuthRequest,
  ) {
    const todo = await this.todosService.create({
      ...createTodoDto,
      owner: Number(req.user.sub),
    });
    return {
      message: 'Task created successfully',
      todo,
    };
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
    const updatedTodo = await this.todosService.update(
      Number(id),
      updateTodoDto,
    );

    return {
      message: 'Task updated successfully',
      todo: updatedTodo,
    };
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @Request() req: AuthRequest) {
    const todo = await this.todosService.findOneByCustomId(Number(id));
    if (!todo) throw new NotFoundException('Todo not found');
    if (todo.owner !== Number(req.user.sub))
      throw new ForbiddenException('Not your todo');
    await this.todosService.remove(Number(id));
    return { message: 'Task deleted successfully' };
  }

  @Patch(':id/status')
  async setStatus(
    @Param('id') id: string,
    @Body('status') status: TodoStatus,
    @Request() req: AuthRequest,
  ) {
    const allowedStatuses = [
      TodoStatus.IN_PROGRESS,
      TodoStatus.COMPLETE,
      TodoStatus.PENDING,
    ];
    if (!allowedStatuses.includes(status)) {
      throw new BadRequestException(
        `Invalid status. Allowed values: ${allowedStatuses.join(', ')}`,
      );
    }
    const todo = await this.todosService.findOneByCustomId(Number(id));
    if (!todo) throw new NotFoundException('Todo not found');
    if (todo.owner !== Number(req.user.sub))
      throw new ForbiddenException('Not your todo');
    await this.todosService.setStatus(Number(id), status);
    return { message: 'Task status updated successfully' };
  }
}
