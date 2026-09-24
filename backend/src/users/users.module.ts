import { Module } from '@nestjs/common';
import { UsersService } from './application/users.service.js';
import { UserRepository } from './domain/user.repository.js';
import { DrizzleUserRepository } from './infrastructure/drizzle-user.repository.js';
import { UsersController } from './infrastructure/http/users.controller.js';

// Routes protégées par le guard global d'AuthModule.
@Module({
  controllers: [UsersController],
  providers: [UsersService, { provide: UserRepository, useClass: DrizzleUserRepository }],
  exports: [UsersService],
})
export class UsersModule {}
