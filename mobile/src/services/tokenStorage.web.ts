const ACCESS_KEY = 'savefood.access';
const REFRESH_KEY = 'savefood.refresh';

function safeGet(key: string): string | null {
  try {
    return typeof window !== 'undefined' ? window.localStorage.getItem(key) : null;
  } catch {
    return null;
  }
}

function safeSet(key: string, value: string): void {
  try {
    if (typeof window !== 'undefined') window.localStorage.setItem(key, value);
  } catch {
  }
}

function safeRemove(key: string): void {
  try {
    if (typeof window !== 'undefined') window.localStorage.removeItem(key);
  } catch {
  }
}

export const tokenStorage = {
  async getAccess(): Promise<string | null> {
    return safeGet(ACCESS_KEY);
  },
  async getRefresh(): Promise<string | null> {
    return safeGet(REFRESH_KEY);
  },
  async set(access: string, refresh: string): Promise<void> {
    safeSet(ACCESS_KEY, access);
    safeSet(REFRESH_KEY, refresh);
  },
  async setAccess(access: string): Promise<void> {
    safeSet(ACCESS_KEY, access);
  },
  async clear(): Promise<void> {
    safeRemove(ACCESS_KEY);
    safeRemove(REFRESH_KEY);
  },
};
