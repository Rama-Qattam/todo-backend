import {
  IsOptional,
  IsString,
  MinLength,
  MaxLength,
  IsDateString,
  IsEnum,
} from 'class-validator';
import { TodoStatus } from '../schemas/todo.schema';

export class UpdateTodoDto {
  @IsOptional()
  @IsString()
  @MinLength(4)
  @MaxLength(20)
  readonly name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  readonly description?: string;

  @IsOptional()
  @IsDateString()
  readonly dueDate?: string;

  @IsOptional()
  @IsEnum(TodoStatus)
  readonly status?: TodoStatus;
}
