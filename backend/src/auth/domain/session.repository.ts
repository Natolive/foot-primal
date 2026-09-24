import { BaseRepository } from '../../common/domain/base.repository.js';
import type { NewSession, Session } from './session.entity.js';

export abstract class SessionRepository extends BaseRepository<Session, NewSession> {
  abstract findValidByTokenHash(tokenHash: string, now: Date): Promise<Session | null>;
  abstract deleteByTokenHash(tokenHash: string): Promise<void>;
}
