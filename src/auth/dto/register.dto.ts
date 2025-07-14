import {
  IsEmail,
  IsNotEmpty,
  MinLength,
  Matches,
  IsOptional,
  IsDateString,
  IsString,
  IsMobilePhone,
} from 'class-validator';
import { Match } from '../../utils/match.decorator';

export class CreateUserDto {
  @IsNotEmpty({ message: 'First name is required' })
  @IsString()
  readonly first_name: string;

  @IsNotEmpty({ message: 'Last name is required' })
  @IsString()
  readonly last_name: string;

  @IsEmail({}, { message: 'Invalid email' })
  @IsNotEmpty({ message: 'Email is required' })
  readonly email: string;

  @IsNotEmpty({ message: 'Password is required' })
  @MinLength(8, { message: 'Password must be at least 8 characters' })
  @Matches(/^(?=.*[A-Z])(?=.*[!@#$%^&*])/, {
    message:
      'Password must contain at least one uppercase letter and one symbol',
  })
  readonly password: string;

  @IsNotEmpty({ message: 'Confirm password is required' })
  @Match('password', { message: 'Passwords do not match' })
  readonly confirm_password: string;

  @IsOptional()
  @IsDateString({}, { message: 'Birthdate must be in yyyy/mm/dd format' })
  readonly birthdate?: string;

  @IsOptional()
  @IsMobilePhone(undefined, {}, { message: 'Phone number is invalid' })
  readonly phone_number?: string;
}
