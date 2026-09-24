import type { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AppModule } from '@src/app.module.js';
import { DB, type Database } from '@src/common/infrastructure/database/database.module.js';
import { users } from '@src/users/infrastructure/user.table.js';
import { eq } from 'drizzle-orm';
import request from 'supertest';

// Parcours complet sur la vraie base (DATABASE_URL du conteneur back).
describe('Auth (e2e)', () => {
  const email = `e2e-${Date.now()}@boite.fr`;
  const account = { lastName: 'Dupont', firstName: 'Léa', email, password: '12345678' };
  let app: INestApplication;
  let db: Database;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = moduleRef.createNestApplication();
    await app.init();
    db = app.get(DB);
  });

  afterAll(async () => {
    await db.delete(users).where(eq(users.email, email));
    await app.close();
  });

  it('signs up, logs in, reads the profile, then logs out', async () => {
    const http = request.agent(app.getHttpServer());

    await http.post('/auth/signup').send(account).expect(201);
    await http.post('/auth/signup').send(account).expect(409);
    await http.post('/auth/login').send({ email, password: 'wrong-password' }).expect(401);

    const login = await http.post('/auth/login').send({ email, password: account.password }).expect(200);
    expect(login.headers['set-cookie']?.[0]).toMatch(/primal_session=.+HttpOnly/);

    const me = await http.get('/auth/me').expect(200);
    expect(me.body).toEqual({ id: expect.any(String), email, firstName: 'Léa', lastName: 'Dupont', role: 'user', onboarded: false, permissions: ['profile.read', 'profile.complete_onboarding', 'events.read', 'events.participate'] });

    await http.post('/auth/me/onboarding').expect(204);
    expect((await http.get('/auth/me').expect(200)).body.onboarded).toBe(true);
    await http.get('/roles').expect(403);
    await http.get('/users').expect(403);

    await db.update(users).set({ role: 'super_admin' }).where(eq(users.email, email));
    const roles = await http.get('/roles').expect(200);
    expect(roles.body).toContainEqual({ role: 'user', permissions: ['profile.read', 'profile.complete_onboarding', 'events.read', 'events.participate'], editable: true });
    await http.put('/roles/super_admin').send({ permissions: [] }).expect(403);
    await http.put('/roles/user').send({ permissions: ['nope'] }).expect(400);

    const list = await http.get('/users').expect(200);
    expect(list.body).toContainEqual(expect.objectContaining({ email, role: 'super_admin', extraPermissions: [] }));
    await http.put(`/users/${me.body.id}/role`).send({ role: 'user' }).expect(403);
    await http.patch(`/users/${me.body.id}`).send({ email, firstName: 'Léo', lastName: 'Dupont' }).expect(200);

    await http.post('/auth/logout').expect(204);
    await http.get('/auth/me').expect(401);
  });
});
