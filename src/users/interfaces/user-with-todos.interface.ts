import { Todo } from 'src/todos/schemas/todo.schema';

export interface UserWithTodos {
  _id: number;
  first_name: string;
  last_name: string;
  email: string;
  birthdate: Date;
  phone_number: string;
  todos: Todo[];
}
