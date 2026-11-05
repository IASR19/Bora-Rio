import { after, before, test } from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'vite';
import { createElement as h } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fileURLToPath } from 'node:url';

const storage = new Map();
globalThis.localStorage = {
  getItem: (key) => storage.get(key) ?? null,
  setItem: (key, value) => storage.set(key, value),
};
Object.defineProperty(globalThis, 'navigator', { value: { language: 'pt-BR' }, configurable: true });
globalThis.document = { documentElement: { lang: '' } };
let server,
  i18n,
  Register,
  AuthProvider,
  LanguageSelector,
  translations,
  CompleteProfile,
  isProfileComplete,
  storageApi,
  ApiError,
  apiErrorSource,
  EventDetail;
before(async () => {
  server = await createServer({
    configFile: false,
    esbuild: { jsx: 'automatic' },
    optimizeDeps: { noDiscovery: true, include: [] },
    resolve: { alias: { '@': fileURLToPath(new URL('../src', import.meta.url)) } },
    server: { middlewareMode: true, ws: false },
    appType: 'custom',
  });
  const accessibleStorage = globalThis.localStorage;
  Object.defineProperty(globalThis, 'localStorage', {
    configurable: true,
    get() {
      throw new DOMException('Blocked storage', 'SecurityError');
    },
  });
  try {
    i18n = await server.ssrLoadModule('/src/i18n/index.tsx');
  } finally {
    Object.defineProperty(globalThis, 'localStorage', { configurable: true, writable: true, value: accessibleStorage });
  }
  storageApi = await server.ssrLoadModule('/src/utils/storage.ts');
  ({ ApiError } = await server.ssrLoadModule('/src/shared/api/client.ts'));
  ({ apiErrorSource } = await server.ssrLoadModule('/src/i18n/errors.ts'));
  ({ Register } = await server.ssrLoadModule('/src/pages/auth/Register.tsx'));
  ({ CompleteProfile } = await server.ssrLoadModule('/src/pages/auth/CompleteProfile.tsx'));
  ({ EventDetail } = await server.ssrLoadModule('/src/pages/event/EventDetail.tsx'));
  ({ isProfileComplete } = await server.ssrLoadModule('/src/utils/profile.ts'));
  ({ AuthProvider } = await server.ssrLoadModule('/src/context/AuthContext.tsx'));
  ({ LanguageSelector } = await server.ssrLoadModule('/src/components/LanguageSelector.tsx'));
  ({ translations } = await server.ssrLoadModule('/src/i18n/translations.ts'));
});
after(async () => {
  await server?.close();
});

test('registration and language selector render in Portuguese, Spanish and English', () => {
  for (const [language, title, name, password] of [
    ['pt', 'Criar conta', 'Nome', 'Senha'],
    ['es', 'Crear cuenta', 'Nombre', 'Contraseña'],
    ['en', 'Create account', 'Name', 'Password'],
  ]) {
    i18n.setLanguage(language);
    const html = renderToStaticMarkup(h(MemoryRouter, null, h(AuthProvider, null, h(LanguageSelector), h(Register))));
    assert.ok(html.includes(title), language);
    assert.ok(html.includes(`placeholder="${name}"`), language);
    assert.ok(html.includes(`placeholder="${password}"`), language);
    assert.ok(html.includes('value="female"'), 'Domain values must remain stable');
    assert.ok(html.includes('href="/login"'), 'Routes must remain stable');
    for (const option of ['Português', 'Español', 'English']) assert.ok(html.includes(option));
  }
});

test('language persistence, document language, interpolation and user content', () => {
  i18n.setLanguage('en');
  assert.equal(storage.get('bora.language'), 'en');
  assert.equal(document.documentElement.lang, 'en');
  assert.equal(i18n.t('Eventos ({count})', { count: 3 }), 'Events (3)');
  assert.equal(i18n.t('An original event name'), 'An original event name');
  i18n.setLanguage('es');
  assert.equal(i18n.t('Eventos ({count})', { count: 3 }), 'Eventos (3)');
  i18n.setLanguage('pt');
  assert.equal(i18n.getLocale(), 'pt-BR');
});

test('every dictionary entry has Spanish and English copy', () => {
  assert.ok(Object.keys(translations).length > 490);
  for (const [key, values] of Object.entries(translations)) {
    assert.ok(values.en.trim(), `Missing English: ${key}`);
    assert.ok(values.es.trim(), `Missing Spanish: ${key}`);
    for (const lang of ['en', 'es']) {
      assert.deepEqual(
        values[lang].match(/\{\w+\}/g) ?? [],
        key.match(/\{\w+\}/g) ?? [],
        `Interpolation mismatch: ${key}`,
      );
    }
  }
});

test('first-login profile requires personal details and supports the three languages', () => {
  assert.equal(isProfileComplete({ birthDate: null, phone: null, city: null }), false);
  assert.equal(
    isProfileComplete({ birthDate: '1990-01-01', phone: '+5521999999999', city: 'Rio de Janeiro - RJ' }),
    true,
  );
  for (const [language, title] of [
    ['pt', 'Complete seu cadastro'],
    ['es', 'Completa tu perfil'],
    ['en', 'Complete your profile'],
  ]) {
    i18n.setLanguage(language);
    const html = renderToStaticMarkup(h(MemoryRouter, null, h(AuthProvider, null, h(CompleteProfile))));
    assert.ok(html.includes(title));
    assert.ok(html.includes('id="complete-name"'));
    assert.ok(html.includes('id="complete-gender"'));
    assert.ok(html.includes('type="date"'));
    assert.ok(html.includes('value="undisclosed"'));
  }
});

test('language selection and device data survive blocked or full local storage within the session', () => {
  const accessibleStorage = globalThis.localStorage;
  Object.defineProperty(globalThis, 'localStorage', {
    configurable: true,
    get() {
      throw new DOMException('Blocked storage', 'SecurityError');
    },
  });
  try {
    assert.equal(storageApi.readLocalStorage('unknown-device'), null);
    assert.doesNotThrow(() => i18n.setLanguage('es'));
    assert.equal(i18n.getLanguage(), 'es');
    assert.equal(document.documentElement.lang, 'es');
    storageApi.writeLocalStorage('bora:device-id', 'session-device');
    assert.equal(storageApi.readLocalStorage('bora:device-id'), 'session-device');
    const html = renderToStaticMarkup(h(MemoryRouter, null, h(AuthProvider, null, h(LanguageSelector), h(Register))));
    assert.ok(html.includes('Crear cuenta'));
    Object.defineProperty(globalThis, 'localStorage', {
      configurable: true,
      writable: true,
      value: {
        getItem() {
          return null;
        },
        setItem() {
          throw new DOMException('Full storage', 'QuotaExceededError');
        },
      },
    });
    assert.doesNotThrow(() => i18n.setLanguage('en'));
    assert.equal(storageApi.readLocalStorage('bora.language'), 'en');
  } finally {
    Object.defineProperty(globalThis, 'localStorage', { configurable: true, writable: true, value: accessibleStorage });
    i18n.setLanguage('pt');
  }
});

test('API errors follow the selected language without exposing untranslated server messages', () => {
  const loginError = new ApiError('Invalid email or password', 400, 'INVALID_CREDENTIALS');
  i18n.setLanguage('pt');
  assert.equal(loginError.message, 'E-mail ou senha inválidos.');
  i18n.setLanguage('es');
  assert.equal(loginError.message, 'Correo o contraseña incorrectos.');
  assert.equal(
    i18n.t('Escolha um local existente ou cadastre um novo.'),
    'Elige un lugar existente o registra uno nuevo.',
  );
  const rejected = new ApiError('Unrecognized server text', 400, 'EVENT_REJECTED');
  assert.equal(rejected.message, 'Este evento fue rechazado y no admite participación.');
  const validation = new ApiError(['phone must be a valid phone number', 'language must be an enum value'], 400);
  assert.equal(validation.message, 'Revisa los datos introducidos.');
  i18n.setLanguage('en');
  assert.equal(loginError.message, 'Invalid email or password.');
  assert.equal(new ApiError('Unexpected implementation detail', 500).message, 'Could not complete the request.');
  assert.equal(apiErrorSource('Telefone já está em uso', 400, 'DUPLICATED_RESOURCE'), 'Telefone já está em uso');
  assert.equal(
    apiErrorSource('Email already registered', 400, 'DUPLICATED_RESOURCE'),
    'Este e-mail já está cadastrado.',
  );
  i18n.setLanguage('pt');
});

test('a rejected event renders its status without participation actions in all three languages', () => {
  const cache = new QueryClient({ defaultOptions: { queries: { retry: false, staleTime: Infinity } } });
  cache.setQueryData(['event', 'rejected-fixture'], {
    id: 'rejected-fixture',
    name: 'Moderated fixture',
    venueId: 'fixture-venue',
    status: 'rejected',
    startsAt: '2026-12-01T20:00:00Z',
    musicGenres: [],
  });
  cache.setQueryData(['venue', 'fixture-venue'], {
    id: 'fixture-venue',
    name: 'Fixture venue',
    city: 'Rio de Janeiro - RJ',
    musicGenres: [],
    vibes: [],
    priceRange: 'medio',
  });
  cache.setQueryData(['favorites', 'mine'], []);
  for (const language of ['pt', 'es', 'en']) {
    i18n.setLanguage(language);
    const html = renderToStaticMarkup(
      h(
        MemoryRouter,
        { initialEntries: ['/event/rejected-fixture'] },
        h(
          QueryClientProvider,
          { client: cache },
          h(AuthProvider, null, h(Routes, null, h(Route, { path: '/event/:id', element: h(EventDetail) }))),
        ),
      ),
    );
    assert.ok(html.includes(i18n.t('Evento rejeitado')));
    assert.ok(html.includes('Moderated fixture'));
    assert.ok(!html.includes(i18n.t('Em análise')));
    assert.ok(!html.includes(i18n.t('Eu vou')));
    assert.ok(!html.includes(i18n.t('Ir para check-in')));
  }
  cache.clear();
  i18n.setLanguage('pt');
});
