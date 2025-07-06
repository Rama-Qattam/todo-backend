/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export enum TodoStatus {
  IN_PROGRESS = 'in progress',
  COMPLETE = 'complete',
  PENDING = 'pending',
  DELETED = 'deleted',
}

export type TodoDocument = Todo &
  Document & { createdAt: Date; updatedAt: Date };

@Schema({ timestamps: true })
export class Todo {
  @Prop({ required: true })
  name: string;

  @Prop()
  description?: string;

  @Prop({ required: true })
  dueDate: Date;

  @Prop({
    type: String,
    enum: TodoStatus,
    default: TodoStatus.IN_PROGRESS,
    required: true,
  })
  status: TodoStatus;

  @Prop({ ref: 'User', required: true })
  owner: number;
  @Prop({ required: true })
  _id: number;
}

export const TodoSchema = SchemaFactory.createForClass(Todo);

TodoSchema.set('toJSON', {
  transform: (doc, ret) => {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});
