/**
 * Storage seguro de tokens JWT — versão nativa (iOS/Android).
 *
 * Usa `expo-secure-store` para guardar os tokens no Keychain (iOS) ou no
 * EncryptedSharedPreferences (Android). Mais seguro que AsyncStorage.
 *
 * Há uma versão paralela `tokenStorage.web.ts` que usa `localStorage` para
 * Web (Metro resolve automaticamente pela extensão).
 */
import * as SecureStore from 'expo-secure-store';

const ACCESS_KEY = 'savefood.access';
const REFRESH_KEY = 'savefood.refresh';

export const tokenStorage = {
  async getAccess(): Promise<string | null> {
    return SecureStore.getItemAsync(ACCESS_KEY);
  },
  async getRefresh(): Promise<string | null> {
    return SecureStore.getItemAsync(REFRESH_KEY);
  },
  async set(access: string, refresh: string): Promise<void> {
    await Promise.all([
      SecureStore.setItemAsync(ACCESS_KEY, access),
      SecureStore.setItemAsync(REFRESH_KEY, refresh),
    ]);
  },
  async setAccess(access: string): Promise<void> {
    await SecureStore.setItemAsync(ACCESS_KEY, access);
  },
  async clear(): Promise<void> {
    await Promise.all([
      SecureStore.deleteItemAsync(ACCESS_KEY),
      SecureStore.deleteItemAsync(REFRESH_KEY),
    ]);
  },
};
