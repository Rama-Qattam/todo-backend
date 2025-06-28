/* eslint-disable @typescript-eslint/no-unused-vars */
import { Injectable, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';
import { CreateUserDto } from './dto/create-user.dto';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async create(createUserDto: CreateUserDto): Promise<Omit<User, 'password'>> {
    const { username, email, password } = createUserDto;
    const userExists = await this.userModel.findOne({
      $or: [{ username }, { email }],
    });
    if (userExists)
      throw new ConflictException('Username or email already exists');

    const hashedPassword = await bcrypt.hash(password, 10);
    const createdUser = new this.userModel({
      username,
      email,
      password: hashedPassword,
    });

    const savedUser = await createdUser.save();
    const userObject = savedUser.toObject();
    const { password: _, ...result } = userObject;
    return result;
  }
  async findByUsername(username: string): Promise<User | null> {
    return this.userModel.findOne({ username });
  }

  async findByEmail(email: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ email });
  }
}
