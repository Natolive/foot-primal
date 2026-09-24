import { ScryptPasswordHasher } from '@src/auth/infrastructure/scrypt-password-hasher.js';

describe('ScryptPasswordHasher', () => {
  it('verifies the right password only', async () => {
    const hasher = new ScryptPasswordHasher();
    const stored = await hasher.hash('12345678');
    expect(stored).not.toContain('12345678');
    expect(await hasher.verify('12345678', stored)).toBe(true);
    expect(await hasher.verify('87654321', stored)).toBe(false);
    expect(await hasher.verify('12345678', 'garbage')).toBe(false);
  });
});
