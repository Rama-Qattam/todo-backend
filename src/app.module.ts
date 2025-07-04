import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { TodosModule } from './todos/todos.module';

@Module({
  imports: [
    MongooseModule.forRoot('mongodb://localhost:27017/todo-app'),
    UsersModule,
    AuthModule,
    TodosModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
