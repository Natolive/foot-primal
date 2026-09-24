import { applyDecorators, CanActivate, ExecutionContext, Injectable, SetMetadata, UseGuards } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { Request } from 'express';
import { TooManyRequestsError } from '../../domain/errors.js';

// `email` : adresse du body (compte visé, boîte qui reçoit les mails) ; `ip` : appelant.
export interface RateLimitRule {
  by: 'email' | 'ip';
  limit: number;
  windowMs: number;
}

// Fenêtre fixe par clé : `limit` requêtes au plus par `windowMs`.
// ponytail: en mémoire, par processus et remis à zéro au redémarrage ; passer par Redis si plusieurs instances de l'API.
export class RateLimiter {
  private readonly windows = new Map<string, { count: number; resetAt: number }>();

  hit(key: string, { limit, windowMs }: RateLimitRule, now = Date.now()): boolean {
    if (this.windows.size > 10_000) for (const [k, w] of this.windows) if (w.resetAt <= now) this.windows.delete(k);
    const window = this.windows.get(key);
    if (!window || window.resetAt <= now) {
      this.windows.set(key, { count: 1, resetAt: now + windowMs });
      return true;
    }
    return ++window.count <= limit;
  }
}

const RULES = 'rate-limit';
const limiter = new RateLimiter();

@Injectable()
class RateLimitGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const rules = this.reflector.get<RateLimitRule[]>(RULES, context.getHandler());
    const req = context.switchToHttp().getRequest<Request>();
    // Guard avant la validation : body brut, normalisé comme `emailField`.
    const email = typeof req.body?.email === 'string' ? req.body.email.trim().toLowerCase() : '';
    const route = `${context.getClass().name}.${context.getHandler().name}`;
    // Toutes les règles comptent la requête, même si l'une bloque.
    const allowed = rules.map((rule) => limiter.hit(`${route}:${rule.by}:${rule.by === 'ip' ? req.ip : email}`, rule));
    if (allowed.includes(false)) throw new TooManyRequestsError('Trop de tentatives, réessaie dans quelques minutes.');
    return true;
  }
}

// Limite une route : `@RateLimit({ by: 'email', limit: 5, windowMs: HOUR })`.
export const RateLimit = (...rules: RateLimitRule[]) => applyDecorators(SetMetadata(RULES, rules), UseGuards(RateLimitGuard));
