import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Todo, TodoDocument, TodoStatus } from './schemas/todo.schema';
import { CreateTodoDto } from './dto/create-todo.dto';
import { UpdateTodoDto } from './dto/update-todo.dto';
import { Counter, CounterDocument } from 'src/common/schemas/counter.schema';
import { getNextSequence } from 'src/utils/get-next-sequence';
import { BadRequestException } from '@nestjs/common/exceptions/bad-request.exception';

@Injectable()
export class TodosService {
  constructor(
    @InjectModel(Todo.name) private todoModel: Model<TodoDocument>,
    @InjectModel(Counter.name) private counterModel: Model<CounterDocument>,
  ) {}

  async create(data: CreateTodoDto & { owner: number }) {
    const due = new Date(data.dueDate);
    if (due < new Date(new Date().toDateString()))
      throw new BadRequestException('Due date cannot be in the past');

    const nextId = await getNextSequence('todos', this.counterModel);

    const todo = new this.todoModel({
      _id: nextId,
      name: data.name,
      description: data.description,
      dueDate: due,
      owner: data.owner,
      status: TodoStatus.IN_PROGRESS,
    });

    const saved = await todo.save();
    return {
      message: 'Task created successfully',
      todo: saved,
    };
  }

  async findByOwner(owner: number) {
    return this.todoModel
      .find({ owner, isDeleted: false })
      .populate('owner')
      .sort({ createdAt: -1 })
      .exec();
  }

  async findOneByCustomId(id: number) {
    return this.todoModel.findOne({ _id: id, isDeleted: false }).exec();
  }

  async update(id: number, updateTodoDto: UpdateTodoDto) {
    const updateData: Record<string, any> = { ...updateTodoDto };
    if (updateTodoDto.dueDate) {
      const due = new Date(updateTodoDto.dueDate);
      if (due < new Date(new Date().toDateString()))
        throw new BadRequestException('Due date cannot be in the past');
      updateData.dueDate = due;
    }
    return this.todoModel
      .findOneAndUpdate({ _id: id, isDeleted: false }, updateData, {
        new: true,
      })
      .exec();
  }

  async setStatus(id: number, status: TodoStatus) {
    return this.todoModel
      .findOneAndUpdate(
        { _id: id, isDeleted: false },
        { status },
        { new: true },
      )
      .exec();
  }

  async findAllWithUsers() {
    return this.todoModel
      .find({ isDeleted: false })
      .populate({
        path: 'owner',
        select: '-password -__v',
      })
      .sort({ createdAt: -1 })
      .exec();
  }

  async remove(id: number) {
    const todo = await this.todoModel.findOne({ _id: id, isDeleted: false });
    if (!todo) throw new NotFoundException('Todo not found');

    todo.isDeleted = true;
    await todo.save();

    return { message: 'Task deleted successfully' };
  }
}
