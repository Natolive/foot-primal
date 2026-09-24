import { PasswordHasher } from '@src/auth/domain/password-hasher.js';

// Hash lisible et instantané : les tests vérifient le cas d'usage, pas la crypto.
export class FakePasswordHasher extends PasswordHasher {
  async hash(password: string) {
    return `hashed:${password}`;
  }

  async verify(password: string, hash: string) {
    return hash === `hashed:${password}`;
  }
}
