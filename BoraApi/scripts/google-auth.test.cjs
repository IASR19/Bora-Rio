const assert = require('node:assert/strict');
const { test } = require('node:test');
require('reflect-metadata');
const { AuthService } = require('../dist/modules/auth/services/auth.service');

const GOOGLE = { email: 'novo@exemplo.com', sub: 'google-123', name: 'Novo', picture: null, email_verified: true };

function buildService({ byGoogleId = null, byEmail = null } = {}) {
  const calls = { created: [] };
  const usersService = {
    findByGoogleId: async () => byGoogleId,
    findByEmail: async () => byEmail,
    isEmailTaken: async (email) => {
      calls.emailChecked = email;
      return Boolean(byEmail);
    },
    linkGoogleId: async () => undefined,
    markEmailVerified: async (id) => {
      calls.markedVerified = id;
    },
    findById: async (id) => ({ id, accountType: 'user' }),
    createFromGoogle: async (data) => {
      calls.created.push(data);
      return { id: 'created', accountType: 'user', ...data };
    },
  };
  const businessVerificationService = {
    normalizeCnpj: () => {
      throw new Error('a consulta do CNPJ não deveria começar');
    },
  };
  const configService = { get: (key) => (key === 'GOOGLE_CLIENT_ID' ? 'client-id' : undefined) };
  const service = new AuthService(usersService, businessVerificationService, {}, {}, {}, configService, {});
  service.googleClient = { verifyIdToken: async () => ({ getPayload: () => GOOGLE }) };
  return { service, calls };
}

test('Google login without an account does not create one when the app asks to choose the account type', async () => {
  const { service, calls } = buildService();
  await assert.rejects(service.loginWithGoogle('token', 'pt', false), (err) => {
    assert.equal(err.getResponse().errorCode, 'GOOGLE_ACCOUNT_NOT_FOUND');
    return true;
  });
  assert.equal(calls.created.length, 0);
});

test('Google login keeps creating a user account by default (older app versions)', async () => {
  const { service, calls } = buildService();
  const user = await service.loginWithGoogle('token', 'pt');
  assert.equal(user.accountType, 'user');
  assert.equal(calls.created[0].email, GOOGLE.email);
});

test('an existing Google account always signs in, even with createAccount=false', async () => {
  const { service } = buildService({ byGoogleId: { id: 'biz', accountType: 'business' } });
  const user = await service.loginWithGoogle('token', 'pt', false);
  assert.equal(user.id, 'biz');
});

test('signing in with Google marks the email as verified (Google only issues verified emails)', async () => {
  const { service, calls } = buildService({ byEmail: { id: 'old', emailVerified: false } });
  await service.loginWithGoogle('token', 'pt', false);
  assert.equal(calls.markedVerified, 'old');
});

test('business signup with Google uses the verified token email and stops before the CNPJ lookup when it is taken', async () => {
  const { service, calls } = buildService({ byEmail: { id: 'old' } });
  await assert.rejects(
    service.registerBusiness({ googleIdToken: 'token', email: 'outro@exemplo.com', name: 'X', phone: '', cnpj: '', contractFile: '', venue: {} }),
    /Email already registered/,
  );
  // O e-mail enviado pelo app é ignorado: vale o do token verificado.
  assert.equal(calls.emailChecked, GOOGLE.email);
});
