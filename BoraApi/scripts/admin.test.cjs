require('dotenv/config');
process.env.NODE_ENV = 'test';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { randomUUID } = require('node:crypto');
const request = require('supertest');
const { Logger } = require('@nestjs/common');
const { DataSource, In } = require('typeorm');
const { createApp } = require('../dist/bootstrap');
const { AuthService } = require('../dist/modules/auth/services/auth.service');
const { User } = require('../dist/modules/users/entities/user.entity');
const { Venue } = require('../dist/modules/venues/entities/venue.entity');
const { Event } = require('../dist/modules/events/entities/event.entity');
const { AdminAudit } = require('../dist/modules/admin/entities/admin-audit.entity');
const { CheckIn } = require('../dist/modules/checkins/entities/checkin.entity');
const { EventParticipation } = require('../dist/modules/events/entities/event-participation.entity');
const { Reward } = require('../dist/modules/rewards/entities/reward.entity');

test(
  'admin access, moderation, geographic analytics and account management',
  {
    skip: !process.env.DATABASE_NAME || !['localhost', '127.0.0.1', '::1'].includes(process.env.DATABASE_HOST),
  },
  async (suite) => {
    Logger.overrideLogger(false);
    const app = await createApp();
    await app.init();
    const db = app.get(DataSource);
    const auth = app.get(AuthService);
    const http = request(app.getHttpServer());
    const suffix = randomUUID();
    const ids = [randomUUID(), randomUUID(), randomUUID()];
    const venueId = randomUUID();
    const eventId = randomUUID();
    const eventIds = [eventId];
    const city = `Admin test ${suffix}`;
    const userRepo = db.getRepository(User);
    let regularToken;
    let adminToken;
    const headers = (token) => ({ Authorization: `Bearer ${token}` });
    try {
      await userRepo.save([
        {
          id: ids[0],
          name: 'Admin Test',
          birthDate: '1990-01-01',
          phone: '+5521999999971',
          email: `admin-${suffix}@example.test`,
          role: 'admin',
          city: `${city} - RJ`,
          isActive: true,
        },
        {
          id: ids[1],
          name: 'User Test',
          birthDate: '1990-01-01',
          phone: '+5521999999972',
          email: `user-${suffix}@example.test`,
          role: 'user',
          city: `${city} - RJ`,
          isActive: true,
        },
        {
          id: ids[2],
          name: 'Business Test',
          email: `business-${suffix}@example.test`,
          role: 'user',
          city: `${city} - RJ`,
          isActive: true,
          businessVerificationStatus: 'pending',
          businessContractFile: 'data:application/pdf;base64,dGVzdA==',
        },
      ]);
      adminToken = auth.issueTokens(await userRepo.findOneByOrFail({ id: ids[0] })).accessToken;
      regularToken = auth.issueTokens(await userRepo.findOneByOrFail({ id: ids[1] })).accessToken;
      await db.getRepository(Venue).save({
        id: venueId,
        name: 'Admin fixture venue',
        category: 'bar',
        priceRange: 'medio',
        address: 'Test',
        latitude: -22,
        longitude: -43,
        city,
        catalogMetadata: { state: 'RJ' },
        verified: false,
      });
      await db.getRepository(Event).save({
        id: eventId,
        venueId,
        name: 'Admin fixture event',
        startsAt: new Date(Date.now() + 86400000),
        status: 'pending_review',
        createdBy: ids[1],
        musicGenres: ['samba'],
      });

      await suite.test('anonymous requests fail; ordinary users cannot access any admin endpoint', async () => {
        for (const endpoint of [
          'dashboard',
          'options',
          'events',
          'users',
          'audit',
          `users/${ids[2]}/business-document`,
        ]) {
          await http.get(`/api/admin/${endpoint}`).expect(401);
          await http.get(`/api/admin/${endpoint}`).set(headers(regularToken)).expect(403);
        }
        await http
          .patch(`/api/admin/events/${eventId}/review`)
          .set(headers(regularToken))
          .send({ decision: 'approved', note: 'Teste de permissão' })
          .expect(403);
        await http.patch('/api/users/me').set(headers(regularToken)).send({ role: 'admin' }).expect(400);
      });
      await suite.test('users are paginated and sensitive fields are excluded', async () => {
        const response = await http
          .get('/api/admin/users')
          .query({ q: suffix, limit: 1, page: 2 })
          .set(headers(adminToken))
          .expect(200);
        assert.equal(response.body.total, 3);
        assert.equal(response.body.items.length, 1);
        assert.equal(response.body.page, 2);
        for (const field of ['passwordHash', 'cpf', 'selfieUrl', 'businessContractFile', 'phone', 'googleId'])
          assert.equal(field in response.body.items[0], false, field);
        await http.get('/api/admin/users?limit=101').set(headers(adminToken)).expect(400);
        await http.get('/api/admin/events?region=Invalid').set(headers(adminToken)).expect(400);
        await http.patch(`/api/admin/users/${ids[1]}`).set(headers(adminToken)).send({ role: null }).expect(400);
      });
      await suite.test('dashboard filters by state, region and city with real database aggregates', async () => {
        const response = await http
          .get('/api/admin/dashboard')
          .query({ city, state: 'RJ', region: 'Sudeste', category: 'bar' })
          .set(headers(adminToken))
          .expect(200);
        assert.equal(response.body.events, 1);
        assert.equal(response.body.users, 3);
        assert.equal(response.body.venues, 1);
        assert.deepEqual(response.body.statuses, [{ label: 'pending_review', count: 1 }]);
        const empty = await http
          .get('/api/admin/dashboard')
          .query({ city, region: 'Sul' })
          .set(headers(adminToken))
          .expect(200);
        assert.equal(empty.body.events, 0);
        await http.get('/api/admin/dashboard?from=2027-02-01&to=2027-01-01').set(headers(adminToken)).expect(400);
      });
      await suite.test('moderation is audited and concurrent decisions cannot overwrite one another', async () => {
        await http
          .patch(`/api/admin/events/${eventId}/review`)
          .set(headers(adminToken))
          .send({ decision: 'approved', note: '' })
          .expect(400);
        const responses = await Promise.all(
          ['approved', 'rejected'].map((decision) =>
            http
              .patch(`/api/admin/events/${eventId}/review`)
              .set(headers(adminToken))
              .send({ decision, note: 'Revisado no teste' }),
          ),
        );
        assert.deepEqual(responses.map((r) => r.status).sort(), [200, 409]);
        assert.equal(await db.getRepository(AdminAudit).countBy({ targetId: eventId }), 1);
        const history = await http.get('/api/admin/audit').set(headers(adminToken)).expect(200);
        const entry = history.body.items.find((item) => item.targetId === eventId);
        assert.equal(entry.actorName, 'Admin Test');
        assert.equal(entry.targetName, 'Admin fixture event');
      });
      await suite.test('roles take effect immediately and own access cannot be removed', async () => {
        await http.patch(`/api/admin/users/${ids[0]}`).set(headers(adminToken)).send({ role: 'user' }).expect(400);
        await http.patch(`/api/admin/users/${ids[0]}`).set(headers(adminToken)).send({ isActive: false }).expect(400);
        await http
          .patch(`/api/admin/users/${ids[1]}`)
          .set(headers(adminToken))
          .send({ role: 'admin', language: 'es' })
          .expect(200);
        await http.get('/api/admin/options').set(headers(regularToken)).expect(200);
        await http.patch(`/api/admin/users/${ids[1]}`).set(headers(adminToken)).send({ role: 'user' }).expect(200);
        await http.get('/api/admin/options').set(headers(regularToken)).expect(403);
      });
      await suite.test(
        'suspension invalidates existing access and refresh tokens; reactivation restores access',
        async () => {
          const refreshToken = auth.issueTokens(await userRepo.findOneByOrFail({ id: ids[1] })).refreshToken;
          await http.patch(`/api/admin/users/${ids[1]}`).set(headers(adminToken)).send({ isActive: false }).expect(200);
          await http.get('/api/users/me').set(headers(regularToken)).expect(401);
          await assert.rejects(() => auth.refreshTokens(refreshToken));
          assert.throws(() => auth.issueTokens({ id: ids[1], email: 'test@example.test', isActive: false }));
          await http.patch(`/api/admin/users/${ids[1]}`).set(headers(adminToken)).send({ isActive: true }).expect(200);
          await http.get('/api/users/me').set(headers(regularToken)).expect(200);
        },
      );
      await suite.test('business documents are protected and decisions are persisted', async () => {
        const doc = await http.get(`/api/admin/users/${ids[2]}/business-document`).set(headers(adminToken)).expect(200);
        assert.equal(doc.body.document, 'data:application/pdf;base64,dGVzdA==');
        await http
          .patch(`/api/admin/users/${ids[2]}/business-review`)
          .set(headers(adminToken))
          .send({ decision: 'rejected', note: 'Documento de teste rejeitado' })
          .expect(200);
        assert.equal((await userRepo.findOneByOrFail({ id: ids[2] })).businessVerificationStatus, 'rejected');
      });
      await suite.test('self service language persists and public registration cannot assign roles', async () => {
        await http.patch('/api/users/me').set(headers(regularToken)).send({ language: 'en' }).expect(200);
        assert.equal((await userRepo.findOneByOrFail({ id: ids[1] })).language, 'en');
        await http.patch('/api/users/me').set(headers(regularToken)).send({ language: 'fr' }).expect(400);
        await http
          .post('/api/auth/register')
          .send({
            name: 'Role Test',
            birthDate: '1990-01-01',
            gender: 'undisclosed',
            email: `role-${suffix}@example.test`,
            phone: '+5521999999988',
            password: 'TestPass123!',
            role: 'admin',
          })
          .expect(400);
        const registered = await http
          .post('/api/auth/register')
          .send({
            name: 'Language Test',
            birthDate: '1990-01-01',
            gender: 'undisclosed',
            email: `language-${suffix}@example.test`,
            phone: `+55219${Math.floor(10000000 + Math.random() * 89999999)}`,
            password: 'TestPass123!',
            language: 'es',
          })
          .expect(201);
        ids.push(registered.body.user.id);
        assert.equal(registered.body.user.language, 'es');
        assert.equal(registered.body.user.role, 'user');
        assert.equal('passwordHash' in registered.body.user, false);
      });
      await suite.test('a first-login administrator must complete their profile and keeps the admin role', async () => {
        const id = randomUUID();
        ids.push(id);
        const account = await userRepo.save(
          userRepo.create({
            id,
            name: 'Administrador',
            email: `first-${suffix}@example.test`,
            role: 'admin',
            isActive: true,
          }),
        );
        const token = auth.issueTokens(account).accessToken;
        await http.get('/api/admin/options').set(headers(token)).expect(403);
        await http
          .patch('/api/users/me')
          .set(headers(token))
          .send({
            name: 'Perfil preenchido',
            gender: 'other',
            birthDate: '1990-01-01',
            phone: `+55219${Math.floor(10000000 + Math.random() * 89999999)}`,
            city: 'Rio de Janeiro - RJ',
          })
          .expect(200);
        await http.get('/api/admin/options').set(headers(token)).expect(200);
        const saved = await userRepo.findOneByOrFail({ id });
        assert.equal(saved.role, 'admin');
        assert.equal(saved.name, 'Perfil preenchido');
        assert.equal(saved.gender, 'other');
      });
      await suite.test('rejection blocks participation, old QR codes, room access and benefit redemption', async () => {
        const id = randomUUID();
        eventIds.push(id);
        await db.getRepository(Event).save({
          id,
          venueId,
          name: 'Rejection fixture',
          startsAt: new Date(Date.now() + 86400000),
          status: 'pending_review',
          createdBy: ids[1],
          musicGenres: ['samba'],
        });
        await http.post(`/api/events/${id}/interested`).set(headers(regularToken)).expect(201);
        const qr = await http.get(`/api/checkins/qr/${id}`).set(headers(regularToken)).expect(200);
        await http
          .post('/api/checkins')
          .set(headers(regularToken))
          .send({ eventId: id, qrToken: qr.body.qrToken, deviceId: 'review-regression' })
          .expect(201);
        const reward = await db.getRepository(Reward).save({
          eventId: id,
          title: 'Rejection benefit',
          validFrom: '00:00',
          validUntil: '23:59',
          quantityTotal: 10,
          quantityRedeemed: 0,
        });
        await http
          .patch(`/api/admin/events/${id}/review`)
          .set(headers(adminToken))
          .send({ decision: 'rejected', note: 'Reprovado no teste' })
          .expect(200);
        for (const action of ['view', 'interested', 'confirmed']) {
          const response = await http.post(`/api/events/${id}/${action}`).set(headers(regularToken)).expect(400);
          assert.equal(response.body.errorCode, 'EVENT_REJECTED');
        }
        await http.get(`/api/checkins/qr/${id}`).set(headers(regularToken)).expect(400);
        await http
          .post('/api/checkins')
          .set(headers(adminToken))
          .send({ eventId: id, qrToken: qr.body.qrToken, deviceId: 'review-regression' })
          .expect(400);
        await http.get(`/api/events/${id}/participants`).expect(400);
        await http.get(`/api/chat/rooms/${id}/messages`).set(headers(regularToken)).expect(400);
        await http
          .post(`/api/chat/rooms/${id}/messages`)
          .set(headers(regularToken))
          .send({ body: 'Blocked message' })
          .expect(400);
        await http.post(`/api/rewards/${reward.id}/redeem`).set(headers(regularToken)).expect(400);
        assert.equal(await db.getRepository(CheckIn).countBy({ eventId: id }), 1);
        assert.equal(await db.getRepository(EventParticipation).countBy({ eventId: id, confirmed: true }), 0);
        const detail = await http.get(`/api/events/${id}`).expect(200);
        assert.equal(detail.body.status, 'rejected');
      });
      await suite.test('published events continue to accept confirmation and check-in', async () => {
        const id = randomUUID();
        eventIds.push(id);
        await db.getRepository(Event).save({
          id,
          venueId,
          name: 'Published fixture',
          startsAt: new Date(Date.now() + 86400000),
          status: 'published',
          musicGenres: ['samba'],
        });
        await http.post(`/api/events/${id}/confirmed`).set(headers(regularToken)).expect(201);
        const qr = await http.get(`/api/checkins/qr/${id}`).set(headers(regularToken)).expect(200);
        await http
          .post('/api/checkins')
          .set(headers(regularToken))
          .send({ eventId: id, qrToken: qr.body.qrToken, deviceId: 'review-regression' })
          .expect(201);
      });
    } finally {
      // Only delete fixtures created by this run, never existing application records.
      await db.getRepository(AdminAudit).delete({ actorId: In(ids) });
      await db.getRepository(Event).delete({ id: In(eventIds) });
      await db.getRepository(Venue).delete({ id: venueId });
      await userRepo.delete({ id: In(ids) });
      await app.close();
    }
  },
);
