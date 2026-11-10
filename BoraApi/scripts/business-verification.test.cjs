const assert = require('node:assert/strict');
const { test } = require('node:test');
require('reflect-metadata');
const {
  decideBusinessStatus,
  BusinessVerificationService,
  CNPJ_LOOKUP_FAILED_NOTE,
} = require('../dist/modules/users/business-verification.service');

const COMPANY = { legalName: 'BAR DO ZE LTDA', tradeName: 'Bar do Zé', active: true, partners: ['JOSE DA SILVA'] };
const MATCH = {
  isCompanyDocument: true,
  cnpjFound: '11222333000181',
  cnpjMatches: true,
  companyNameMatches: true,
  partnersMatch: true,
  confidence: 'high',
  reason: 'Contrato social da empresa, assinado pelo sócio.',
};

test('AI never approves on its own: everything matching still goes to admin review with an advisory note', () => {
  const decision = decideBusinessStatus(COMPANY, MATCH);
  assert.equal(decision.status, 'pending');
  assert.match(decision.note, /^Parecer da IA: tudo confere \(alta confiança\)\. Contrato social/);
  // Contrato de constituição anterior ao CNPJ: sem CNPJ no documento, vale a razão social.
  assert.match(decideBusinessStatus(COMPANY, { ...MATCH, cnpjFound: '', cnpjMatches: false }).note, /tudo confere/);
});

test('without an official partner list (MEI/individual), partners are not required to match', () => {
  const decision = decideBusinessStatus({ ...COMPANY, partners: [] }, { ...MATCH, partnersMatch: false });
  assert.equal(decision.status, 'pending');
  assert.match(decision.note, /tudo confere/);
});

test('every case stays pending (never auto-approved or auto-rejected) and the note explains the doubt', () => {
  const cases = [
    [decideBusinessStatus({ ...COMPANY, active: false }, MATCH), /não está com situação ATIVA/],
    [decideBusinessStatus(COMPANY, null), /não conseguimos analisar o documento/],
    [decideBusinessStatus(COMPANY, { ...MATCH, confidence: 'medium' }), /sem divergências, mas com confiança média/],
    [decideBusinessStatus(COMPANY, { ...MATCH, companyNameMatches: false }), /razão social não confere/],
    [decideBusinessStatus(COMPANY, { ...MATCH, cnpjMatches: false }), /CNPJ do documento não confere/],
    [decideBusinessStatus(COMPANY, { ...MATCH, isCompanyDocument: false }), /não parece contrato social/],
    [decideBusinessStatus(COMPANY, { ...MATCH, partnersMatch: false }), /sócios não conferem/],
  ];
  for (const [decision, note] of cases) {
    assert.equal(decision.status, 'pending');
    assert.match(decision.note, note);
  }
});

test('review: a CNPJ lookup outage does not block signup, it leaves a note for the admin', async (t) => {
  const service = new BusinessVerificationService({}, { get: () => undefined });
  t.mock.method(console, 'warn', () => {});
  t.mock.method(globalThis, 'fetch', async () => new Response('{}', { status: 503 }));
  const result = await service.review('11222333000181', 'data:application/pdf;base64,dGVzdA==');
  assert.equal(result.company, null);
  assert.deepEqual(result.decision, { status: 'pending', note: CNPJ_LOOKUP_FAILED_NOTE });
});

test('review: rejects a contract file that is not PDF or image before any lookup', async (t) => {
  const service = new BusinessVerificationService({}, { get: () => undefined });
  const fetchMock = t.mock.method(globalThis, 'fetch', async () => Response.json({}));
  await assert.rejects(service.review('11222333000181', 'data:text/plain;base64,dGVzdA=='), /PDF ou imagem/);
  assert.equal(fetchMock.mock.callCount(), 0);
});

test('CNPJ lookup falls back to the next public source when one is down', async (t) => {
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
  const service = new BusinessVerificationService({}, { get: () => undefined });
  t.mock.method(globalThis, 'fetch', async () => new Response('{}', { status: 404 }));
  await assert.rejects(service.fetchCompany('11222333000181'), /não encontrado/);
});

test('404 mixed with an outage is not "not found": user can retry', async (t) => {
  const service = new BusinessVerificationService({}, { get: () => undefined });
  t.mock.method(console, 'warn', () => {});
  let calls = 0;
  t.mock.method(globalThis, 'fetch', async () => {
    calls += 1;
    return new Response('{}', { status: calls === 1 ? 404 : 503 });
  });
  assert.equal(await service.fetchCompany('11222333000181'), null);
});
