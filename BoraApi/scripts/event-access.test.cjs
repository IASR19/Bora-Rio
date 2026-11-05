const { test } = require('node:test');
const assert = require('node:assert/strict');
const { EventsService } = require('../dist/modules/events/events.service');
const { CheckinsService } = require('../dist/modules/checkins/checkins.service');

function eventsWithStatus(status) {
  const event = { id: 'fixture', status };
  const manager = {
    findOne: async () => event,
    getRepository() {
      throw new Error('Rejected event must not reach participation writes');
    },
  };
  const service = new EventsService(
    { findOne: async () => event, manager: { transaction: (work) => work(manager) } },
    {},
    {},
    {},
    {},
  );
  return { service, event };
}
const rejected = (error) => error.getResponse().errorCode === 'EVENT_REJECTED';

test('rejected events allow read-only details but block all participation writes before repository access', async () => {
  const { service } = eventsWithStatus('rejected');
  assert.equal((await service.findById('fixture')).status, 'rejected');
  for (const action of ['markViewed', 'markInterested', 'markConfirmed']) {
    await assert.rejects(() => service[action]('guest', 'fixture'), rejected);
  }
  await assert.rejects(() => service.getParticipants('fixture'), rejected);
});

test('both pending and published events still accept participation', async () => {
  for (const status of ['pending_review', 'published']) {
    const { service } = eventsWithStatus(status);
    const result = await service.withParticipatingEvent('fixture', async (event) => event.status);
    assert.equal(result, status);
  }
});

test('rejected events cannot issue QR codes or use a previously issued one', async () => {
  const { service } = eventsWithStatus('rejected');
  const checkins = new CheckinsService(
    {},
    service,
    {
      verify: () => ({ eventId: 'fixture', nonce: 'old-qr' }),
      sign() {
        throw new Error('QR signing must not be reached');
      },
    },
    { get: () => 'test-secret' },
  );
  await assert.rejects(() => checkins.generateQrToken('fixture'), rejected);
  await assert.rejects(
    () => checkins.confirm('guest', { eventId: 'fixture', qrToken: 'old', deviceId: 'device' }),
    rejected,
  );
});
