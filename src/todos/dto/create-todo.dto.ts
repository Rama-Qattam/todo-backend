import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateTodoDto {
  @IsNotEmpty()
  @IsString()
  readonly title: string;

  @IsOptional()
  @IsString()
  readonly description?: string;
}
