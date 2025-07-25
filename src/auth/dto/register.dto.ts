import {
  IsEmail,
  IsNotEmpty,
  MinLength,
  Matches,
  IsOptional,
  IsDateString,
  IsString,
} from 'class-validator';
import { Match } from '../../utils/match.decorator';

export class CreateUserDto {
  @IsString({ message: 'First name must be a string' }) //بدلت اماكنهم عشان تظهر مسج First name is required
  @IsNotEmpty({ message: 'First name is required' })
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
  @Matches(/^\+9627[789]\d{7}$/, {
    message:
      'Phone number must be a valid Jordanian number starting with +9627',
  })
  readonly phone_number?: string;
}
