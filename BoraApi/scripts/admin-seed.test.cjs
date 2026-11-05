const assert = require('node:assert/strict');
const { test } = require('node:test');
const bcrypt = require('bcrypt');
const { ensureAdmin, ADMIN_EMAIL } = require('../dist/seeds/admin.seed');

function database(existing = null) {
  let stored = existing;
  const audit = [];
  const locks = [];
  const repository = {
    findOne: async () => stored,
    create: (values) => ({ id: 'seed-user', ...values }),
    save: async (value) => {
      stored = value;
      return value;
    },
  };
  return {
    manager: {
      query: async (sql) => locks.push(sql),
      getRepository: () => repository,
      save: async (_, value) => audit.push(value),
    },
    audit,
    locks,
  };
}

test('admin seed creates the requested account with hashed password and incomplete profile', async () => {
  const db = database();
  const user = await ensureAdmin(db.manager);
  assert.equal(user.email, ADMIN_EMAIL);
  assert.equal(user.role, 'admin');
  assert.equal(user.isActive, true);
  assert.equal(await bcrypt.compare('190899', user.passwordHash), true);
  for (const field of ['birthDate', 'phone', 'city']) assert.equal(user[field], null);
  assert.equal(db.audit.length, 1);
  assert.ok(db.locks[0].includes('pg_advisory_xact_lock'));
  assert.equal((await ensureAdmin(db.manager)).id, user.id);
  assert.equal(db.audit.length, 1);
});

test('repeated admin seed preserves a completed profile, changed password and suspended status', async () => {
  const existing = {
    id: 'existing',
    email: ADMIN_EMAIL,
    role: 'admin',
    passwordHash: 'changed-hash',
    name: 'Real name',
    birthDate: '1990-01-01',
    phone: '+5521999999999',
    city: 'Rio de Janeiro - RJ',
    isActive: false,
  };
  const original = { ...existing };
  const db = database(existing);
  assert.equal(await ensureAdmin(db.manager), existing);
  assert.deepEqual(existing, original);
  assert.equal(db.audit.length, 0);
});

test('admin seed does not overwrite an ordinary or deleted account', async () => {
  for (const existing of [{ role: 'user' }, { role: 'admin', deletedAt: new Date() }]) {
    const db = database(existing);
    await assert.rejects(() => ensureAdmin(db.manager), /Nenhum dado foi alterado/);
    assert.equal(db.audit.length, 0);
  }
});
