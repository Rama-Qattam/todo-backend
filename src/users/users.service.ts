/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  Injectable,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';
import { CreateUserDto } from './dto/create-user.dto';
import * as bcrypt from 'bcryptjs';
import { getNextSequence } from 'src/utils/get-next-sequence';
import { Counter, CounterDocument } from 'src/common/schemas/counter.schema';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Counter.name) private counterModel: Model<CounterDocument>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<Omit<User, 'password'>> {
    const {
      email,
      password,
      confirm_password,
      first_name,
      last_name,
      birthdate,
      phone_number,
    } = createUserDto;

    const userExists = await this.userModel.findOne({ email });
    if (userExists) throw new ConflictException('Email already exists');

    if (password !== confirm_password)
      throw new BadRequestException('Passwords do not match');

    const hashedPassword = await bcrypt.hash(password, 10);
    const nextId = await getNextSequence('users', this.counterModel);

    const createdUser = new this.userModel({
      _id: nextId,
      first_name,
      last_name,
      email,
      password: hashedPassword,
      birthdate,
      phone_number,
    });

    const savedUser = await createdUser.save();

    const userObj: any = savedUser.toObject();
    delete userObj.password;
    return userObj;
  }

  async findByEmail(email: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ email });
  }
}
