import {
  Injectable,
  ConflictException,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';
import { CreateUserDto } from './dto/create-user.dto';
import * as bcrypt from 'bcryptjs';
import { getNextSequence } from 'src/utils/get-next-sequence';
import { Counter, CounterDocument } from 'src/common/schemas/counter.schema';
import { UserWithTodos } from './interfaces/user-with-todos.interface';
import * as crypto from 'crypto';
import { sendResetEmail } from 'src/users/mailer/nodemailer';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Counter.name) private counterModel: Model<CounterDocument>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<UserWithTodos> {
    const {
      email,
      password,
      confirm_password,
      first_name,
      last_name,
      birthdate,
      phone_number,
    } = createUserDto;

    const userExists = await this.userModel.findOne({
      email,
      isDeleted: false,
    });
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
      isDeleted: false,
    });

    const savedUser = await createdUser.save();

    const userObj = savedUser.toJSON() as Omit<UserWithTodos, 'todos'>;
    return { ...userObj, todos: [] };
  }

  async findByEmail(email: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ email, isDeleted: false });
  }

  async findAllWithTodos(): Promise<UserWithTodos[]> {
    const users = await this.userModel.aggregate<UserWithTodos>([
      { $match: { isDeleted: false } },
      {
        $lookup: {
          from: 'todos',
          localField: '_id',
          foreignField: 'owner',
          as: 'todos',
        },
      },
      {
        $project: {
          password: 0,
          __v: 0,
        },
      },
    ]);
    return users;
  }
  async findOneWithTodos(id: number): Promise<UserWithTodos | null> {
    const users = await this.userModel.aggregate<UserWithTodos>([
      { $match: { _id: id, isDeleted: false } },
      {
        $lookup: {
          from: 'todos',
          localField: '_id',
          foreignField: 'owner',
          as: 'todos',
        },
      },
      {
        $project: {
          password: 0,
          __v: 0,
        },
      },
    ]);

    return users[0] || null;
  }

  async resetPassword(
    token: string,
    newPassword: string,
    confirmPassword: string,
  ) {
    const user = await this.userModel.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: new Date() },
      isDeleted: false,
    });
    if (!user) throw new BadRequestException('Token invalid or expired.');
    if (newPassword !== confirmPassword)
      throw new BadRequestException('Passwords do not match.');

    user.password = await bcrypt.hash(newPassword, 10);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    return { message: 'Password reset successful.' };
  }
  async requestPasswordReset(email: string) {
    const user = await this.userModel.findOne({ email, isDeleted: false });
    if (!user) throw new NotFoundException('User not found');

    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpires = new Date(Date.now() + 1000 * 60 * 60);

    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = resetTokenExpires;
    await user.save();

    await sendResetEmail(user.email, resetToken);

    return { message: 'Reset password email sent' };
  }

  async softDeleteUser(id: number) {
    const user = await this.userModel.findById(id);
    if (!user || user.isDeleted)
      throw new NotFoundException('User not found or already deleted');

    user.isDeleted = true;
    await user.save();

    return { message: 'User deleted successfully' };
  }
}
