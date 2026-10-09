const assert = require('node:assert/strict');
const { test } = require('node:test');
require('reflect-metadata');
const { decideBusinessStatus } = require('../dist/modules/users/business-verification.service');
const { EventsService } = require('../dist/modules/events/events.service');
const { BoraScoreService } = require('../dist/shared/services/bora-score.service');

const COMPANY = { legalName: 'BAR DO ZE LTDA', tradeName: 'Bar do Zé', active: true, partners: ['JOSE DA SILVA'] };
const MATCH = {
  isCompanyDocument: true,
  cnpjFound: '11222333000181',
  cnpjMatches: true,
  companyNameMatches: true,
  userCpfIsPartner: true,
  confidence: 'high',
  reason: 'Contrato social da empresa, assinado pelo sócio.',
};

test('approves only when everything matches with high confidence', () => {
  assert.equal(decideBusinessStatus(COMPANY, MATCH, true).status, 'approved');
  // Contrato de constituição anterior ao CNPJ: sem CNPJ no documento, vale a razão social.
  assert.equal(decideBusinessStatus(COMPANY, { ...MATCH, cnpjFound: '', cnpjMatches: false }, true).status, 'approved');
});

test('without verified identity (CPF) it never auto-approves', () => {
  // O nome do perfil é editável pelo próprio usuário: só o CPF verificado prova quem envia.
  assert.equal(decideBusinessStatus(COMPANY, MATCH, false).status, 'pending');
});

test('any doubt goes to manual review, never auto-rejected', () => {
  const pending = [
    decideBusinessStatus({ ...COMPANY, active: false }, MATCH, true),
    decideBusinessStatus(COMPANY, null, true),
    decideBusinessStatus(COMPANY, { ...MATCH, confidence: 'medium' }, true),
    decideBusinessStatus(COMPANY, { ...MATCH, companyNameMatches: false }, true),
    decideBusinessStatus(COMPANY, { ...MATCH, cnpjMatches: false }, true),
    decideBusinessStatus(COMPANY, { ...MATCH, userCpfIsPartner: false }, true),
    decideBusinessStatus(COMPANY, { ...MATCH, isCompanyDocument: false }, true),
  ];
  for (const decision of pending) assert.equal(decision.status, 'pending');
});

function eventsService(creator, venue) {
  const saved = [];
  const repository = { create: (values) => values, save: async (values) => (saved.push(values), values) };
  const venuesService = {
    findById: async () => venue,
    createFromUser: async () => ({ ...venue, verified: false }),
    markVerifiedByBusiness: async (v, cnpj) => ({ ...v, cnpj, verified: true }),
  };
  const usersService = { findById: async () => creator };
  return { service: new EventsService(repository, {}, new BoraScoreService(), venuesService, usersService), saved };
}

const DTO = { venueId: 'v1', name: 'Festa', musicGenres: ['pop'], startsAt: new Date(Date.now() + 86_400_000).toISOString() };
const VERIFIED_VENUE = { id: 'v1', verified: true };
const USER = { phoneVerified: false, cpf: null, selfieUrl: null, businessVerificationStatus: null, businessCnpj: null };

test('business event requires a submitted CNPJ', async () => {
  const { service } = eventsService(USER, VERIFIED_VENUE);
  await assert.rejects(service.create('u1', { ...DTO, asBusiness: true }), /CNPJ/);
});

test('business with CNPJ under review stays pending even at a verified venue', async () => {
  const { service, saved } = eventsService({ ...USER, businessVerificationStatus: 'pending' }, VERIFIED_VENUE);
  await service.create('u1', { ...DTO, asBusiness: true });
  assert.equal(saved[0].status, 'pending_review');
  assert.equal(saved[0].createdAsBusiness, true);
});

test('approved business publishes and verifies the new venue it creates', async () => {
  const creator = { ...USER, businessVerificationStatus: 'approved', businessCnpj: '11222333000181' };
  const { service, saved } = eventsService(creator, VERIFIED_VENUE);
  const event = await service.create('u1', {
    ...DTO,
    venueId: undefined,
    newVenue: { name: 'Bar Novo', category: 'bar', address: 'Rua 1', latitude: -22, longitude: -45 },
    asBusiness: true,
  });
  assert.equal(saved[0].status, 'published');
  assert.equal(event.venue.verified, true);
  assert.equal(event.venue.cnpj, '11222333000181');
});

test('CNPJ lookup falls back to the next public source when one is down', async (t) => {
  const { BusinessVerificationService } = require('../dist/modules/users/business-verification.service');
  const service = new BusinessVerificationService({}, { get: () => undefined });
  t.mock.method(console, 'warn', () => {});
  const calls = [];
  t.mock.method(globalThis, 'fetch', async (url) => {
    calls.push(url);
    if (calls.length === 1) return new Response('{"message":"503"}', { status: 500 });
    return Response.json({ razao_social: 'BAR DO ZE LTDA', situacao_cadastral: 'Ativa', QSA: [{ nome_socio: 'JOSE' }] });
  });
  const company = await service.fetchCompany('11222333000181');
  assert.equal(calls.length, 2);
  assert.deepEqual(company, { legalName: 'BAR DO ZE LTDA', tradeName: null, active: true, partners: ['JOSE'] });
});

test('404 from a monthly-snapshot source falls through: a newly opened company is still found', async (t) => {
  const { BusinessVerificationService } = require('../dist/modules/users/business-verification.service');
  const service = new BusinessVerificationService({}, { get: () => undefined });
  t.mock.method(console, 'warn', () => {});
  let calls = 0;
  t.mock.method(globalThis, 'fetch', async () => {
    calls += 1;
    if (calls < 3) return new Response('{}', { status: 404 });
    return Response.json({ razao_social: 'BAR NOVO LTDA', descricao_situacao_cadastral: 'ATIVA', qsa: [] });
  });
  const company = await service.fetchCompany('11222333000181');
  assert.equal(company.legalName, 'BAR NOVO LTDA');
});

test('CNPJ is "not found" only when every source answers 404', async (t) => {
  const { BusinessVerificationService } = require('../dist/modules/users/business-verification.service');
  const service = new BusinessVerificationService({}, { get: () => undefined });
  t.mock.method(globalThis, 'fetch', async () => new Response('{}', { status: 404 }));
  await assert.rejects(service.fetchCompany('11222333000181'), /não encontrado/);
});

test('404 mixed with an outage is not "not found": user can retry', async (t) => {
  const { BusinessVerificationService } = require('../dist/modules/users/business-verification.service');
  const service = new BusinessVerificationService({}, { get: () => undefined });
  t.mock.method(console, 'warn', () => {});
  let calls = 0;
  t.mock.method(globalThis, 'fetch', async () => {
    calls += 1;
    return new Response('{}', { status: calls === 1 ? 404 : 503 });
  });
  assert.equal(await service.fetchCompany('11222333000181'), null);
});
