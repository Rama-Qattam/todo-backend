import { IsEmail, IsNotEmpty, Matches } from 'class-validator';

export class LoginDto {
  @IsEmail({}, { message: 'Invalid email' }) //new message
  @IsNotEmpty({ message: 'Email is required' }) //new
  readonly email: string;

  @IsNotEmpty({ message: 'Password is required' }) //new message
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*]).{8,}$/, {
    //new
    message:
      'Password must be at least 8 characters long and include uppercase, lowercase, number, and special character',
  })
  readonly password: string;
}
