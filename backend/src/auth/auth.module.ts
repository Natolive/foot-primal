import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { RolesModule } from '../roles/roles.module.js';
import { UsersModule } from '../users/users.module.js';
import { AuthService } from './application/auth.service.js';
import { PasswordHasher } from './domain/password-hasher.js';
import { SessionRepository } from './domain/session.repository.js';
import { DrizzleSessionRepository } from './infrastructure/drizzle-session.repository.js';
import { AuthController } from './infrastructure/http/auth.controller.js';
import { SessionGuard } from './infrastructure/http/session.guard.js';
import { ScryptPasswordHasher } from './infrastructure/scrypt-password-hasher.js';

@Module({
  imports: [UsersModule, RolesModule],
  controllers: [AuthController],
  providers: [
    AuthService,
    // Global : `@Authorize(droit)` suffit sur une route de n'importe quel module.
    { provide: APP_GUARD, useClass: SessionGuard },
    { provide: PasswordHasher, useClass: ScryptPasswordHasher },
    { provide: SessionRepository, useClass: DrizzleSessionRepository },
  ],
})
export class AuthModule {}
