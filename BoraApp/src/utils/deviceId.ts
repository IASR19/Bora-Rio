import { readLocalStorage, writeLocalStorage } from '@/utils/storage';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function getDeviceId(): string {
  const key = 'bora:device-id';
  let id = readLocalStorage(key);
  if (!id || !UUID.test(id)) {
    id = crypto.randomUUID();
    writeLocalStorage(key, id);
  }
  return id;
}
