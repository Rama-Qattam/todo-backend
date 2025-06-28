import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Todo, TodoDocument } from './schemas/todo.schema';
import { CreateTodoDto } from './dto/create-todo.dto';
import { UpdateTodoDto } from './dto/update-todo.dto';
import { Counter, CounterDocument } from 'src/common/schemas/counter.schema';

@Injectable()
export class TodosService {
  constructor(
    @InjectModel(Todo.name) private todoModel: Model<TodoDocument>,
    @InjectModel(Counter.name) private counterModel: Model<CounterDocument>, // <-- add this
  ) {}

  async findByOwner(ownerId: string) {
    return this.todoModel.find({ owner: ownerId }).exec();
  }

  async findOneById(id: string) {
    return this.todoModel.findById(id).exec();
  }

  async create(data: CreateTodoDto & { owner: string }) {
    const todo = new this.todoModel(data);
    return todo.save();
  }

  async update(id: string, updateTodoDto: UpdateTodoDto) {
    return this.todoModel
      .findByIdAndUpdate(id, updateTodoDto, { new: true })
      .exec();
  }

  async remove(id: string) {
    return this.todoModel.findByIdAndDelete(id).exec();
  }
}
