import { useCallback, useSyncExternalStore } from 'react';

export interface PreferencesDraft {
  intentions: string[];
  musicGenres: string[];
  venueVibes: string[];
  ageInterestMin: number;
  ageInterestMax: number;
  maxDistanceKm: number;
  priceRanges: string[];
}

const STORAGE_KEY = 'bora:preferences-draft';

const defaultDraft: PreferencesDraft = {
  intentions: [],
  musicGenres: [],
  venueVibes: [],
  ageInterestMin: 25,
  ageInterestMax: 45,
  maxDistanceKm: 10,
  priceRanges: [],
};

function read(): PreferencesDraft {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    return raw ? { ...defaultDraft, ...JSON.parse(raw) } : defaultDraft;
  } catch {
    return defaultDraft;
  }
}

const listeners = new Set<() => void>();
let snapshot = read();

function emit() {
  listeners.forEach((listener) => listener());
}

function write(draft: PreferencesDraft) {
  snapshot = draft;
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
  } catch {
    /* ignore quota/private-mode errors */
  }
  emit();
}

export function usePreferencesDraft() {
  const state = useSyncExternalStore(
    (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    () => snapshot,
  );

  const update = useCallback((patch: Partial<PreferencesDraft>) => {
    write({ ...snapshot, ...patch });
  }, []);

  const toggleInArray = useCallback((key: keyof PreferencesDraft, value: string) => {
    const current = snapshot[key] as string[];
    const next = current.includes(value) ? current.filter((v) => v !== value) : [...current, value];
    write({ ...snapshot, [key]: next });
  }, []);

  return { draft: state, update, toggleInArray };
}
