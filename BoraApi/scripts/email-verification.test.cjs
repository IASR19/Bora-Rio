const assert = require('node:assert/strict');
const { test } = require('node:test');
require('reflect-metadata');
const { AuthService } = require('../dist/modules/auth/services/auth.service');
const { User } = require('../dist/modules/users/entities/user.entity');

/** Banco em memória com o mínimo que o serviço usa: usuários e códigos. */
function buildService({ emailVerified = false, mailFails = false } = {}) {
  const user = { id: 'u1', email: 'pessoa@exemplo.com', name: 'Pessoa Teste', language: 'pt', emailVerified };
  const codes = [];
  const sent = [];
  const matches = (row, where) => Object.entries(where).every(([key, value]) => row[key] === value);
  const repository = {
    findOne: async ({ where }) => codes.filter((row) => matches(row, where)).sort((a, b) => b.createdAt - a.createdAt)[0] ?? null,
    update: async (where, changes) => codes.filter((row) => matches(row, where)).forEach((row) => Object.assign(row, changes)),
    create: (data) => ({ attempts: 0, consumed: false, ...data }),
    save: async (row) => {
      if (!row.id) Object.assign(row, { id: `c${codes.length + 1}`, createdAt: new Date() }) && codes.push(row);
      return row;
    },
    delete: async ({ id }) => codes.splice(codes.findIndex((row) => row.id === id), 1),
  };
  const manager = {
    findOne: async () => user,
    getRepository: () => repository,
    update: async (entity, where, changes) => {
      assert.equal(entity, User);
      Object.assign(user, changes);
    },
  };
  const dataSource = { transaction: (work) => work(manager) };
  const mailService = {
    send: async (message) => {
      if (mailFails) throw new Error('falha no envio');
      sent.push(message);
    },
  };
  const service = new AuthService({}, {}, {}, dataSource, {}, {}, mailService, repository);
  return { service, user, codes, sent };
}

test('sends a 6-digit code to the account email and waits 60 s before sending another', async () => {
  const { service, sent } = buildService();
  const first = await service.requestEmailVerification('u1');
  assert.equal(first.sent, true);
  assert.match(first.code, /^\d{6}$/);
  assert.equal(sent[0].to, 'pessoa@exemplo.com');
  assert.ok(sent[0].text.includes(first.code));

  const second = await service.requestEmailVerification('u1');
  assert.equal(second.sent, false);
  assert.ok(second.retryInSeconds > 0 && second.retryInSeconds <= 60);
  assert.equal(sent.length, 1);
});

test('a verified account gets no code', async () => {
  const { service, sent } = buildService({ emailVerified: true });
  assert.deepEqual(await service.requestEmailVerification('u1'), { sent: false, retryInSeconds: 0 });
  assert.equal(sent.length, 0);
});

test('a failed send does not lock the resend behind the wait', async () => {
  const { service, codes } = buildService({ mailFails: true });
  await assert.rejects(service.requestEmailVerification('u1'));
  assert.equal(codes.length, 0);
});

test('the right code verifies the email', async () => {
  const { service, user } = buildService();
  const { code } = await service.requestEmailVerification('u1');
  await service.confirmEmailVerification('u1', code);
  assert.equal(user.emailVerified, true);
});

test('five wrong attempts invalidate the code, even if the right one comes next', async () => {
  const { service, user, codes } = buildService();
  const { code } = await service.requestEmailVerification('u1');
  const wrong = code === '000000' ? '111111' : '000000';
  for (let i = 0; i < 5; i += 1) await assert.rejects(service.confirmEmailVerification('u1', wrong), /Invalid or expired/);
  assert.equal(codes[0].attempts, 5);
  await assert.rejects(service.confirmEmailVerification('u1', code), /Invalid or expired/);
  assert.equal(user.emailVerified, false);
});
