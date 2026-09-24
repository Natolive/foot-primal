import { CanActivate, createParamDecorator, ExecutionContext, Injectable, SetMetadata } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { Permission } from '@primal/shared';
import type { Request } from 'express';
import { AuthService, type AuthenticatedUser } from '../../application/auth.service.js';
import { readSessionCookie } from './session-cookie.js';

type AuthenticatedRequest = Request & { user: AuthenticatedUser };

const PERMISSION = 'permission';

// Guard global (APP_GUARD) : n'agit que sur les routes marquées `@Authorize`, les autres restent publiques.
@Injectable()
export class SessionGuard implements CanActivate {
  constructor(
    private readonly auth: AuthService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const permission = this.reflector.get<Permission | undefined>(PERMISSION, context.getHandler());
    if (!permission) return true;
    const req = context.switchToHttp().getRequest<AuthenticatedRequest>();
    req.user = await this.auth.authenticate(readSessionCookie(req));
    this.auth.authorize(req.user, permission);
    return true;
  }
}

// Protège une route derrière un droit : `@Authorize('profile.read')`, puis `@CurrentUser() user` dans le handler.
export const Authorize = (permission: Permission) => SetMetadata(PERMISSION, permission);

export const CurrentUser = createParamDecorator(
  (_: unknown, context: ExecutionContext) => context.switchToHttp().getRequest<AuthenticatedRequest>().user,
);
