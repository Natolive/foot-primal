import { BaseRepository } from '../../common/domain/base.repository.js';
import type { NewUser, User } from './user.entity.js';

export abstract class UserRepository extends BaseRepository<User, NewUser> {
  abstract findByEmail(email: string): Promise<User | null>;
}
