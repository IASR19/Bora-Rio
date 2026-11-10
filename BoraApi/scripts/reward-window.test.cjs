const assert = require('node:assert/strict');
const { test } = require('node:test');
const { isWithinRewardWindow, formatRewardTime } = require('../dist/modules/rewards/reward-window');

/** Horário de São Paulo (UTC-3, sem horário de verão desde 2019). */
const at = (time) => new Date(`2026-06-01T${time}:00-03:00`);

test('reward window: normal same-day window, boundaries inclusive', () => {
  assert.equal(isWithinRewardWindow('18:00', '22:00', at('17:59')), false);
  assert.equal(isWithinRewardWindow('18:00', '22:00', at('18:00')), true);
  assert.equal(isWithinRewardWindow('18:00', '22:00', at('20:30')), true);
  assert.equal(isWithinRewardWindow('18:00', '22:00', at('22:00')), true);
  assert.equal(isWithinRewardWindow('18:00', '22:00', at('22:01')), false);
});

test('reward window: crossing midnight (20:00 → 02:00)', () => {
  assert.equal(isWithinRewardWindow('20:00', '02:00', at('19:59')), false);
  assert.equal(isWithinRewardWindow('20:00', '02:00', at('20:00')), true);
  assert.equal(isWithinRewardWindow('20:00', '02:00', at('23:59')), true);
  assert.equal(isWithinRewardWindow('20:00', '02:00', at('00:00')), true);
  assert.equal(isWithinRewardWindow('20:00', '02:00', at('02:00')), true);
  assert.equal(isWithinRewardWindow('20:00', '02:00', at('02:01')), false);
  assert.equal(isWithinRewardWindow('20:00', '02:00', at('12:00')), false);
});

test('reward window: uses São Paulo time regardless of the server time zone, and accepts HH:MM:SS', () => {
  // 01:30 UTC = 22:30 em São Paulo do dia anterior.
  assert.equal(isWithinRewardWindow('22:00:00', '23:00:00', new Date('2026-06-02T01:30:00Z')), true);
  assert.equal(isWithinRewardWindow('01:00:00', '02:00:00', new Date('2026-06-02T01:30:00Z')), false);
});

test('reward window: whole day and same start/end', () => {
  assert.equal(isWithinRewardWindow('00:00', '23:59', at('00:00')), true);
  assert.equal(isWithinRewardWindow('00:00', '23:59', at('23:59')), true);
  assert.equal(isWithinRewardWindow('10:00', '10:00', at('03:00')), true);
});

test('reward window: message time drops the seconds Postgres returns', () => {
  assert.equal(formatRewardTime('20:00:00'), '20:00');
  assert.equal(formatRewardTime('02:30'), '02:30');
});
