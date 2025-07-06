import {
  IsNotEmpty,
  MinLength,
  MaxLength,
  IsOptional,
  IsString,
  IsDateString,
} from 'class-validator';

export class CreateTodoDto {
  @IsNotEmpty()
  @MinLength(4)
  @MaxLength(20)
  readonly name: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  readonly description?: string;

  @IsNotEmpty()
  @IsDateString()
  readonly dueDate: string;
}
