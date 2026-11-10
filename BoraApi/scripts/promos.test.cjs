require('dotenv/config');
process.env.NODE_ENV = 'test';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { randomUUID } = require('node:crypto');
const request = require('supertest');
const { Logger } = require('@nestjs/common');
const { DataSource, In } = require('typeorm');
const {
  isRewardEventDay,
  isWithinRewardWindow,
  rewardWindowEnd,
  formatSaoPauloClock,
} = require('../dist/modules/rewards/reward-window');
const { normalizePublicCode, randomPublicCode } = require('../dist/shared/helpers/random-code.helper');

/** Instante no relógio de São Paulo (UTC-3, sem horário de verão desde 2019). */
const sp = (dateTime) => new Date(`${dateTime}:00-03:00`);
const PUBLIC_CODE = /^BORA-[23456789ABCDEFGHJKLMNPQRSTUVWXYZ]{5}$/;
const END_OF_MINUTE = 59_999;

// ------------------------------------------------------------------ regras puras (sem banco)

test('event day: same São Paulo date, next day for windows crossing midnight, or inside a multi-day event', () => {
  const event = { startsAt: sp('2026-06-01T20:00'), endsAt: null };
  assert.equal(isRewardEventDay(event, '20:00', '23:00', sp('2026-06-01T10:00')), true);
  assert.equal(isRewardEventDay(event, '20:00', '23:00', sp('2026-06-02T21:00')), false);
  assert.equal(isRewardEventDay(event, '20:00', '23:00', sp('2026-05-31T21:00')), false);
  // Janela 22:00 → 02:00: a madrugada seguinte ainda é "o dia do evento" até o fim da janela.
  assert.equal(isRewardEventDay(event, '22:00', '02:00', sp('2026-06-02T01:30')), true);
  assert.equal(isRewardEventDay(event, '22:00', '02:00', sp('2026-06-02T02:01')), false);
  assert.equal(isRewardEventDay(event, '20:00', '23:00', sp('2026-06-02T01:30')), false);
  // Evento no sábado às 20:00, promoção 20:00 → 02:00: a madrugada do sábado é a véspera.
  const saturday = { startsAt: sp('2026-06-06T20:00'), endsAt: null };
  const available = (when) =>
    isRewardEventDay(saturday, '20:00', '02:00', sp(when)) && isWithinRewardWindow('20:00', '02:00', sp(when));
  assert.equal(available('2026-06-06T01:00'), false, 'Saturday 01:00 is the night before the event');
  assert.equal(available('2026-06-06T21:00'), true, 'Saturday 21:00');
  assert.equal(available('2026-06-07T01:00'), true, 'Sunday 01:00');
  assert.equal(available('2026-06-07T03:00'), false, 'Sunday 03:00');
  // Evento de vários dias.
  const festival = { startsAt: sp('2026-06-01T20:00'), endsAt: sp('2026-06-03T23:00') };
  assert.equal(isRewardEventDay(festival, '20:00', '23:00', sp('2026-06-02T21:00')), true);
  assert.equal(isRewardEventDay(festival, '20:00', '23:00', sp('2026-06-04T21:00')), false);
});

test('window end: next time the São Paulo clock hits validUntil (inclusive minute), next day when crossing midnight', () => {
  assert.equal(rewardWindowEnd('23:00', sp('2026-06-01T22:50')).getTime(), sp('2026-06-01T23:00').getTime() + END_OF_MINUTE);
  assert.equal(rewardWindowEnd('02:00', sp('2026-06-01T23:30')).getTime(), sp('2026-06-02T02:00').getTime() + END_OF_MINUTE);
  assert.equal(rewardWindowEnd('02:00', sp('2026-06-02T01:00')).getTime(), sp('2026-06-02T02:00').getTime() + END_OF_MINUTE);
  assert.equal(formatSaoPauloClock(sp('2026-06-01T22:14')), '22:14');
});

test('public code: BORA-XXXXX without confusing characters; the business can type it with or without the prefix', () => {
  for (let i = 0; i < 200; i += 1) assert.match(randomPublicCode(), PUBLIC_CODE);
  assert.equal(normalizePublicCode('7k3p9'), 'BORA-7K3P9');
  assert.equal(normalizePublicCode(' bora 7K3P9 '), 'BORA-7K3P9');
  assert.equal(normalizePublicCode('BORA-7K3P9'), 'BORA-7K3P9');
  assert.equal(normalizePublicCode('bora7k3p9'), 'BORA-7K3P9');
});

// ------------------------------------------------------------------ integração (banco local)

test(
  'printed promotion QR: page, scans, signup attribution, gift claim, delivery and stats',
  {
    skip: !process.env.DATABASE_NAME || !['localhost', '127.0.0.1', '::1'].includes(process.env.DATABASE_HOST),
  },
  async (suite) => {
    // Carregados só aqui: o build do Nest abre conexão com o banco.
    const { createApp } = require('../dist/bootstrap');
    const { AuthService } = require('../dist/modules/auth/services/auth.service');
    const { UsersService } = require('../dist/modules/users/users.service');
    const { User } = require('../dist/modules/users/entities/user.entity');
    const { Venue } = require('../dist/modules/venues/entities/venue.entity');
    const { Event } = require('../dist/modules/events/entities/event.entity');
    const { Reward } = require('../dist/modules/rewards/entities/reward.entity');
    const { RewardRedemption } = require('../dist/modules/rewards/entities/reward-redemption.entity');
    const { CheckIn } = require('../dist/modules/checkins/entities/checkin.entity');
    const { PromoScan } = require('../dist/modules/promos/entities/promo-scan.entity');
    const { PromosService } = require('../dist/modules/promos/promos.service');
    const { RewardsService } = require('../dist/modules/rewards/rewards.service');

    Logger.overrideLogger(false);
    const app = await createApp();
    await app.init();
    const db = app.get(DataSource);
    const auth = app.get(AuthService);
    const promos = app.get(PromosService);
    const http = request(app.getHttpServer());
    const userRepo = db.getRepository(User);
    const rewardRepo = db.getRepository(Reward);
    const redemptionRepo = db.getRepository(RewardRedemption);
    const suffix = randomUUID().slice(0, 8);
    const userIds = [];
    const venueIds = [];
    const headers = (user) => ({ Authorization: `Bearer ${auth.issueTokens(user).accessToken}` });
    let clock = sp('2026-06-01T21:00');
    let allDayId;
    promos.clock = () => clock;
    const newUser = async (fields) => {
      const user = await userRepo.save({ name: 'Pessoa Teste', email: `promo-${randomUUID()}@example.test`, ...fields });
      userIds.push(user.id);
      return user;
    };

    try {
      const owner = await newUser({ name: 'Dono Promo', accountType: 'business', businessVerificationStatus: 'approved' });
      const otherOwner = await newUser({ name: 'Outro Dono', accountType: 'business', businessVerificationStatus: 'approved' });
      const ana = await newUser({ name: 'Ana Souza', emailVerified: true });
      const bruno = await newUser({ name: 'Bruno Lima', emailVerified: true });
      const carla = await newUser({ name: 'Carla Dias', emailVerified: true });
      const venue = await db.getRepository(Venue).save({
        name: `Promo venue ${suffix}`,
        category: 'bar',
        priceRange: 'medio',
        address: 'Test',
        latitude: -22,
        longitude: -43,
        city: `Promo test ${suffix}`,
        verified: true,
        ownerUserId: owner.id,
      });
      venueIds.push(venue.id);
      const event = await db.getRepository(Event).save({
        venueId: venue.id,
        name: 'Noite do chope',
        startsAt: sp('2026-06-01T20:00'),
        status: 'published',
        musicGenres: ['samba'],
      });
      const gift = await rewardRepo.save({
        eventId: event.id,
        kind: 'gift',
        title: 'Chope grátis',
        validFrom: '20:00',
        validUntil: '23:00',
        quantityTotal: 5,
        quantityRedeemed: 0,
      });
      const lateGift = await rewardRepo.save({
        eventId: event.id,
        kind: 'gift',
        title: 'Saideira',
        validFrom: '22:00',
        validUntil: '02:00',
        quantityTotal: 1,
        quantityRedeemed: 0,
      });
      const fixed = await rewardRepo.save({
        eventId: event.id,
        kind: 'fixed_price',
        title: 'Caipirinha a R$10',
        priceCents: 1000,
        validFrom: '20:00',
        validUntil: '23:00',
      });
      const codeOf = async (reward) => (await http.get(`/api/business/rewards/${reward.id}/qr`).set(headers(owner)).expect(200)).body.code;
      let giftCode;
      let lateCode;
      let fixedCode;

      await suite.test('every new account gets a unique BORA-XXXXX code, returned by GET /users/me', async () => {
        const users = app.get(UsersService);
        const byEmail = await users.create({
          cpf: null,
          name: 'Cadastro Email',
          email: `promo-email-${suffix}@example.test`,
          phone: null,
          birthDate: '1990-01-01',
          gender: 'undisclosed',
          passwordHash: 'x',
        });
        userIds.push(byEmail.id);
        const byGoogle = await users.createFromGoogle({
          name: 'Cadastro Google',
          email: `promo-google-${suffix}@example.test`,
          googleId: `promo-google-${suffix}`,
        });
        userIds.push(byGoogle.id);
        const codes = [owner, otherOwner, ana, bruno, carla, byEmail, byGoogle].map((user) => user.publicCode);
        for (const code of codes) assert.match(code, PUBLIC_CODE);
        assert.equal(new Set(codes).size, codes.length);
        const [index] = await db.query(
          `SELECT indexdef FROM pg_indexes WHERE tablename = 'users' AND indexdef LIKE '%UNIQUE%(public_code)%'`,
        );
        assert.ok(index, 'users.public_code must have a unique index');
        await assert.rejects(userRepo.update({ id: bruno.id }, { publicCode: ana.publicCode }));

        const me = await http.get('/api/users/me').set(headers(ana)).expect(200);
        assert.equal(me.body.publicCode, ana.publicCode);
        assert.equal('signupRewardId' in me.body, false);
      });

      await suite.test('only the venue owner gets the promotion QR; the code is created once and kept', async () => {
        giftCode = await codeOf(gift);
        assert.match(giftCode, /^[23456789ABCDEFGHJKLMNPQRSTUVWXYZ]{10}$/);
        const again = await http.get(`/api/business/rewards/${gift.id}/qr`).set(headers(owner)).expect(200);
        assert.deepEqual(again.body, { code: giftCode, path: `/p/${giftCode}` });
        lateCode = await codeOf(lateGift);
        fixedCode = await codeOf(fixed);
        assert.notEqual(lateCode, giftCode);
        await http.get(`/api/business/rewards/${gift.id}/qr`).set(headers(otherOwner)).expect(403);
        await http.get(`/api/business/rewards/${gift.id}/qr`).set(headers(ana)).expect(403);
        await http.get(`/api/business/rewards/${randomUUID()}/qr`).set(headers(owner)).expect(404);
      });

      await suite.test('the public page tells whether the promotion is valid right now', async () => {
        const page = await http.get(`/api/promos/${giftCode.toLowerCase()}`).expect(200);
        assert.equal(page.body.title, 'Chope grátis');
        assert.equal(page.body.validFrom, '20:00');
        assert.equal(page.body.validUntil, '23:00');
        assert.equal(page.body.event.title, 'Noite do chope');
        assert.equal(page.body.venue.name, venue.name);
        assert.equal(page.body.availableNow, true);
        assert.equal(page.body.soldOut, false);
        clock = sp('2026-06-02T21:00');
        assert.equal((await http.get(`/api/promos/${giftCode}`).expect(200)).body.availableNow, false);
        clock = sp('2026-06-01T19:59');
        assert.equal((await http.get(`/api/promos/${giftCode}`).expect(200)).body.availableNow, false);
        await http.get('/api/promos/NAOEXISTE2').expect(404);
      });

      await suite.test('scans are deduplicated per person or device for 30 minutes', async () => {
        const d1 = randomUUID();
        const scan = (body, user) => {
          const req = http.post(`/api/promos/${giftCode}/scans`).send(body);
          return (user ? req.set(headers(user)) : req).expect(200);
        };
        assert.equal((await scan({ deviceId: d1 })).body.recorded, true);
        assert.equal((await scan({ deviceId: d1 })).body.recorded, false);
        assert.equal((await scan({ deviceId: randomUUID() }, ana)).body.recorded, true);
        assert.equal((await scan({ deviceId: randomUUID() }, ana)).body.recorded, false, 'same user');
        assert.equal((await scan({})).body.recorded, false, 'no user and no device cannot be counted');
        assert.equal((await scan({ deviceId: randomUUID() }, owner)).body.recorded, false, 'business account');
        await http.post(`/api/promos/${giftCode}/scans`).send({ deviceId: 'not-a-uuid' }).expect(400);
        await http.post('/api/promos/NAOEXISTE2/scans').send({ deviceId: randomUUID() }).expect(404);
        const scans = await db.getRepository(PromoScan).findBy({ rewardId: gift.id });
        assert.equal(scans.length, 2);
        assert.equal(scans.find((s) => s.userId === ana.id).existingUser, true);
        assert.equal(scans.find((s) => s.userId === null).existingUser, false);

        await db.query(`UPDATE promo_scans SET created_at = created_at - interval '31 minutes' WHERE reward_id = $1`, [gift.id]);
        assert.equal((await scan({ deviceId: d1 })).body.recorded, true, 'after 30 min it counts again');
      });

      await suite.test('signup is attributed only to new accounts (< 2 h) without an origin yet', async () => {
        const newbie = await newUser({ name: 'Nina Nova' });
        const attribute = (user, code = giftCode) => http.post(`/api/promos/${code}/signup`).set(headers(user));
        assert.equal((await attribute(newbie).expect(200)).body.attributed, true);
        assert.equal((await attribute(newbie, lateCode).expect(200)).body.attributed, false, 'already attributed');
        const stored = await userRepo.findOne({ where: { id: newbie.id }, select: { id: true, signupRewardId: true } });
        assert.equal(stored.signupRewardId, gift.id);

        await db.query(`UPDATE users SET created_at = created_at - interval '3 hours' WHERE id = $1`, [bruno.id]);
        assert.equal((await attribute(bruno).expect(200)).body.attributed, false, 'old account');
        await attribute(newbie, 'NAOEXISTE2').expect(404);
        await http.post(`/api/promos/${giftCode}/signup`).expect(401);
        await attribute(owner).expect(403);

        // A pessoa nova lê logada: conta como leitura, mas não como "já tinha conta".
        await http.post(`/api/promos/${giftCode}/scans`).set(headers(newbie)).send({ deviceId: randomUUID() }).expect(200);
      });

      await suite.test('price/discount promotions just inform; gifts are refused outside the event day or window', async () => {
        clock = sp('2026-06-01T21:00');
        const info = await http.post(`/api/promos/${fixedCode}/claim`).set(headers(ana)).expect(200);
        assert.deepEqual(info.body, { kind: 'fixed_price', status: 'info' });

        await http.post(`/api/promos/${giftCode}/claim`).expect(401);
        await http.post(`/api/promos/${giftCode}/claim`).set(headers(owner)).expect(403);
        const unverified = await newUser({ name: 'Sem Email' });
        const blocked = await http.post(`/api/promos/${giftCode}/claim`).set(headers(unverified)).expect(403);
        assert.equal(blocked.body.message, 'Confirme seu e-mail para resgatar.');
        assert.equal(blocked.body.errorCode, 'EMAIL_NOT_VERIFIED');
        for (const when of ['2026-06-02T21:00', '2026-06-01T19:00', '2026-06-01T23:01']) {
          clock = sp(when);
          const refused = await http.post(`/api/promos/${giftCode}/claim`).set(headers(ana)).expect(400);
          assert.equal(refused.body.message, 'Esta promoção vale no dia do evento, das 20:00 às 23:00.');
        }
        assert.equal(await redemptionRepo.countBy({ rewardId: gift.id }), 0);
      });

      await suite.test('a gift claim lasts 1 h (capped at the window end); reading again returns it, renews it or shows it expired', async () => {
        const claim = (user) => http.post(`/api/promos/${giftCode}/claim`).set(headers(user)).expect(200);
        const stock = async () => (await rewardRepo.findOneByOrFail({ id: gift.id })).quantityRedeemed;

        clock = sp('2026-06-01T21:00');
        const first = (await claim(ana)).body;
        assert.equal(first.kind, 'gift');
        assert.equal(first.status, 'active');
        assert.equal(first.title, 'Chope grátis');
        assert.equal(first.publicCode, ana.publicCode);
        assert.equal(new Date(first.claimedAt).getTime(), sp('2026-06-01T21:00').getTime());
        assert.equal(new Date(first.expiresAt).getTime(), sp('2026-06-01T22:00').getTime());
        assert.equal(first.deliveredAt, null);
        assert.equal(await stock(), 1);
        const stored = await redemptionRepo.findOneByOrFail({ rewardId: gift.id, userId: ana.id });
        assert.equal(stored.source, 'qr');

        clock = sp('2026-06-01T21:30');
        const again = (await claim(ana)).body;
        assert.equal(again.status, 'active');
        assert.equal(again.claimedAt, first.claimedAt);
        assert.equal(again.expiresAt, first.expiresAt);
        assert.equal(await stock(), 1, 'reading again does not spend stock');

        // Venceu sem entregar e a promoção ainda vale: renova o mesmo resgate, limitado às 23:00.
        clock = sp('2026-06-01T22:30');
        const renewed = (await claim(ana)).body;
        assert.equal(renewed.status, 'active');
        assert.equal(renewed.claimedAt, first.claimedAt, 'renewal keeps the original redemption time');
        assert.equal(new Date(renewed.expiresAt).getTime(), sp('2026-06-01T23:00').getTime() + END_OF_MINUTE);
        assert.equal(await stock(), 1, 'renewal does not spend stock');
        assert.equal(await redemptionRepo.countBy({ rewardId: gift.id, userId: ana.id }), 1);

        // Depois do fim da janela: expirado, sem erro e sem renovar.
        clock = sp('2026-06-01T23:30');
        const expired = (await claim(ana)).body;
        assert.equal(expired.status, 'expired');
        assert.equal(expired.claimedAt, renewed.claimedAt);
        assert.equal(await stock(), 1);

        // Leu às 22:50 numa promoção até 23:00: expira às 23:00, não às 23:50.
        clock = sp('2026-06-01T22:50');
        const late = (await claim(bruno)).body;
        assert.equal(new Date(late.expiresAt).getTime(), sp('2026-06-01T23:00').getTime() + END_OF_MINUTE);
        assert.equal(await stock(), 2);
      });

      await suite.test('windows crossing midnight and sold-out gifts', async () => {
        clock = sp('2026-06-01T23:30');
        const claimed = await http.post(`/api/promos/${lateCode}/claim`).set(headers(carla)).expect(200);
        assert.equal(new Date(claimed.body.expiresAt).getTime(), sp('2026-06-02T00:30').getTime());
        clock = sp('2026-06-02T01:00');
        assert.equal((await http.get(`/api/promos/${lateCode}`).expect(200)).body.availableNow, true);
        assert.equal((await http.get(`/api/promos/${lateCode}`).expect(200)).body.soldOut, true);
        const soldOut = await http.post(`/api/promos/${lateCode}/claim`).set(headers(ana)).expect(400);
        assert.equal(soldOut.body.message, 'Benefício esgotado');
        // A dona do último brinde continua vendo o dela.
        clock = sp('2026-06-02T00:10');
        assert.equal((await http.post(`/api/promos/${lateCode}/claim`).set(headers(carla)).expect(200)).body.status, 'active');
      });

      await suite.test('delivery by the person code: unknown, expired, delivered once, then shown as delivered', async () => {
        const deliver = (publicCode, user = owner) =>
          http.post(`/api/business/rewards/${gift.id}/deliver`).set(headers(user)).send({ publicCode });

        clock = sp('2026-06-01T22:55');
        assert.equal((await deliver('ZZZZZ').expect(400)).body.message, 'Essa pessoa não leu o QR desta promoção.');
        assert.equal(
          (await deliver(carla.publicCode).expect(400)).body.message,
          'Essa pessoa não leu o QR desta promoção.',
          'Carla only claimed the other promotion',
        );
        await deliver(bruno.publicCode, otherOwner).expect(403);

        // Ana: prazo venceu (renovado às 22:30 até 23:00), e agora já são 23:30.
        clock = sp('2026-06-01T23:30');
        assert.equal(
          (await deliver(ana.publicCode).expect(400)).body.message,
          'O prazo desse benefício expirou. Peça para a pessoa ler o QR de novo.',
        );

        // Bruno: aceita o código sem o prefixo e em minúsculas.
        clock = sp('2026-06-01T22:55');
        const delivered = await deliver(` ${bruno.publicCode.slice(5).toLowerCase()} `).expect(200);
        assert.equal(delivered.body.publicCode, bruno.publicCode);
        assert.equal(delivered.body.firstName, 'Bruno');
        assert.equal(new Date(delivered.body.deliveredAt).getTime(), sp('2026-06-01T22:55').getTime());
        assert.equal((await deliver(bruno.publicCode).expect(400)).body.message, 'Benefício já entregue às 22:55.');

        clock = sp('2026-06-01T22:58');
        const after = await http.post(`/api/promos/${giftCode}/claim`).set(headers(bruno)).expect(200);
        assert.equal(after.body.status, 'delivered');
        assert.equal(new Date(after.body.deliveredAt).getTime(), sp('2026-06-01T22:55').getTime());
      });

      await suite.test('the legacy check-in redemption is stored as source=checkin without a deadline', async () => {
        const allDay = await rewardRepo.save({
          eventId: event.id,
          kind: 'gift',
          title: 'Brinde do check-in',
          validFrom: '00:00',
          validUntil: '00:00',
          quantityRedeemed: 0,
        });
        await db.getRepository(CheckIn).save({ userId: carla.id, eventId: event.id, qrNonce: 'n', checkedInAt: new Date() });
        const redemption = await app.get(RewardsService).redeem(carla.id, allDay.id);
        assert.equal(redemption.source, 'checkin');
        assert.equal(redemption.expiresAt, null);
        allDayId = allDay.id;

        // Já usou pelo check-in: o QR mostra como entregue, e a baixa é recusada.
        const allDayCode = await codeOf(allDay);
        const claimed = await http.post(`/api/promos/${allDayCode}/claim`).set(headers(carla)).expect(200);
        assert.equal(claimed.body.status, 'delivered');
        assert.equal(new Date(claimed.body.deliveredAt).getTime(), redemption.redeemedAt.getTime());
        assert.equal(await redemptionRepo.countBy({ rewardId: allDay.id, userId: carla.id }), 1);
        const refused = await http
          .post(`/api/business/rewards/${allDay.id}/deliver`)
          .set(headers(owner))
          .send({ publicCode: carla.publicCode })
          .expect(400);
        assert.equal(refused.body.message, `Benefício já entregue às ${formatSaoPauloClock(redemption.redeemedAt)}.`);
        const [row] = (await http.get(`/api/business/rewards/${allDay.id}/redemptions`).set(headers(owner)).expect(200)).body;
        assert.equal(row.expired, false);
        assert.equal(new Date(row.deliveredAt).getTime(), redemption.redeemedAt.getTime());
      });

      await suite.test('the owner sees stats per promotion, the redemption list and dashboard totals', async () => {
        await http.get(`/api/business/events/${event.id}/promotions/stats`).set(headers(otherOwner)).expect(403);
        await http.get(`/api/business/events/${randomUUID()}/promotions/stats`).set(headers(owner)).expect(404);
        const stats = (await http.get(`/api/business/events/${event.id}/promotions/stats`).set(headers(owner)).expect(200)).body;
        const giftStats = stats.find((row) => row.rewardId === gift.id);
        // Aparelhos d1 (sem login, 2 leituras), d2 (Ana) e d4 (Nina, cadastro novo).
        assert.deepEqual(giftStats, { rewardId: gift.id, scans: 3, newSignups: 1, existingUsers: 1, redeemed: 2, delivered: 1 });
        const lateStats = stats.find((row) => row.rewardId === lateGift.id);
        assert.deepEqual(lateStats, { rewardId: lateGift.id, scans: 0, newSignups: 0, existingUsers: 0, redeemed: 1, delivered: 0 });
        assert.equal(stats.length, 4);
        const checkinStats = stats.find((row) => row.rewardId === allDayId);
        assert.equal(checkinStats.redeemed, 1);
        assert.equal(checkinStats.delivered, 1, 'check-in redemptions count as delivered');

        clock = sp('2026-06-01T23:30');
        await http.get(`/api/business/rewards/${gift.id}/redemptions`).set(headers(otherOwner)).expect(403);
        const list = (await http.get(`/api/business/rewards/${gift.id}/redemptions`).set(headers(owner)).expect(200)).body;
        assert.equal(list.length, 2);
        assert.deepEqual(
          list.map((row) => [row.publicCode, row.firstName, row.expired, Boolean(row.deliveredAt)]),
          [
            [bruno.publicCode, 'Bruno', false, true], // leu às 22:50 (mais recente)
            [ana.publicCode, 'Ana', true, false], // leu às 21:00, renovou às 22:30 e venceu às 23:00
          ],
        );

        const dashboard = (await http.get('/api/business/dashboard').set(headers(owner)).expect(200)).body;
        assert.equal(dashboard.totals.promoScans, 3);
        assert.equal(dashboard.totals.promoSignups, 1);
        assert.equal(typeof dashboard.totals.checkins, 'number');
      });
    } finally {
      // Só as fixtures desta execução: o local leva eventos, promoções, leituras e resgates (cascade).
      await db.getRepository(Venue).delete({ id: In(venueIds) });
      if (userIds.length) await userRepo.delete({ id: In(userIds) });
      await app.close();
    }
  },
);
