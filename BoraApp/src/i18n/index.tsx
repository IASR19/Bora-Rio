import { useEffect, useSyncExternalStore } from 'react';
import { translations } from './translations';
import { readLocalStorage, writeLocalStorage } from '@/utils/storage';

export type Language = 'pt' | 'es' | 'en';
const valid = (value: string | null): value is Language => ['pt', 'es', 'en'].includes(value ?? '');
const saved = readLocalStorage('bora.language');
let language: Language = valid(saved)
  ? saved
  : navigator.language.startsWith('es')
    ? 'es'
    : navigator.language.startsWith('en')
      ? 'en'
      : 'pt';
const listeners = new Set<() => void>();
export const getLanguage = () => language;
export const getLocale = () => ({ pt: 'pt-BR', es: 'es', en: 'en' })[language];
export function setLanguage(value: Language) {
  language = value;
  writeLocalStorage('bora.language', value);
  document.documentElement.lang = getLocale();
  listeners.forEach((listener) => listener());
}
export function t(text: string, params?: Record<string, string | number>): string {
  const message = language === 'pt' ? text : (translations[text]?.[language] ?? text);
  return message.replace(/\{(\w+)\}/g, (match, key) => String(params?.[key] ?? match));
}
export function useI18n() {
  const current = useSyncExternalStore(
    (listener) => {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    getLanguage,
    getLanguage,
  );
  useEffect(() => {
    document.documentElement.lang = getLocale();
  }, [current]);
  return { language: current, locale: getLocale(), setLanguage, t };
}
