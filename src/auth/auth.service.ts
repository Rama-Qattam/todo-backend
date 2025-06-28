/* eslint-disable @typescript-eslint/no-unused-vars */
import { Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { UserDocument } from '../users/schemas/user.schema';
import { UserResponseDto } from '../users/dto/user-response.dto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(
    email: string,
    pass: string,
  ): Promise<UserResponseDto | null> {
    const user = await this.usersService.findByEmail(email);
    if (user && (await bcrypt.compare(pass, user.password))) {
      const { password, ...result } = user.toObject() as UserDocument;
      return {
        _id: result._id?.toString() ?? '',
        username: result.username ?? '',
        email: result.email ?? '',
      };
    }
    return null;
  }

  login(user: UserResponseDto) {
    const payload = { username: user.username, sub: user._id };
    return {
      access_token: this.jwtService.sign(payload),
      user,
    };
  }
}
