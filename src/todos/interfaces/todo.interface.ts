export enum TodoStatus {
  Pending = 'Pending',
  InProgress = 'InProgress',
  Completed = 'Completed',
  Cancelled = 'Cancelled',
}

export interface Todo {
  _id: number;
  name: string;
  description?: string;
  dueDate: Date;
  status: TodoStatus;
  owner: number;
  createdAt: Date;
  updatedAt: Date;
}
