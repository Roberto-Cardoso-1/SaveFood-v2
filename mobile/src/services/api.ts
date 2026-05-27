import axios, { AxiosError, AxiosRequestConfig } from 'axios';
import { tokenStorage } from './tokenStorage';

/**
 * Axios singleton + interceptors JWT.
 *
 * - Lê `EXPO_PUBLIC_API_URL` em runtime (`process.env` funciona com prefixo
 *   `EXPO_PUBLIC_` no Expo SDK 50+).
 * - Anexa `Authorization: Bearer <access>` em cada request quando há token.
 * - Em 401 tenta refresh **uma vez** com fila (evita N refreshes paralelos).
 * - Em falha de refresh, dispara `onAuthError` (registrado pela camada de auth)
 *   para a UI deslogar.
 *
 * IMPORTAÇÃO de storage: usa `./tokenStorage` que tem duas implementações:
 * - `tokenStorage.ts`  → SecureStore (mobile)
 * - `tokenStorage.web.ts` → localStorage (web)
 * Metro escolhe a certa por extensão.
 *
 * NÃO importa stores diretamente — quebraria por ciclo. A camada
 * `services/auth.ts` injeta callbacks com `setAuthCallbacks`.
 */

const FALLBACK_URL = 'https://savefood-api.onrender.com/api/';

export const API_BASE_URL =
  (process.env.EXPO_PUBLIC_API_URL as string | undefined) || FALLBACK_URL;

export { tokenStorage };

// ---------------------------------------------------------------------------
// Callbacks injetáveis (preenchidos por services/auth.ts no bootstrap)
// ---------------------------------------------------------------------------

type AuthCallbacks = {
  onAuthError?: () => void;
};
let callbacks: AuthCallbacks = {};
export function setAuthCallbacks(cb: AuthCallbacks) {
  callbacks = { ...callbacks, ...cb };
}

// ---------------------------------------------------------------------------
// Axios
// ---------------------------------------------------------------------------

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    Accept: 'application/json',
  },
});

api.interceptors.request.use(async (config) => {
  // FormData → não setar Content-Type manualmente (axios calcula o boundary).
  const isFormData =
    typeof FormData !== 'undefined' && config.data instanceof FormData;
  if (!isFormData && !config.headers['Content-Type']) {
    config.headers['Content-Type'] = 'application/json';
  }

  const access = await tokenStorage.getAccess();
  if (access) {
    config.headers.Authorization = `Bearer ${access}`;
  }
  return config;
});

// ---------------------------------------------------------------------------
// Refresh com fila (evita N refreshes simultâneos quando várias requests
// estouram 401 ao mesmo tempo).
// ---------------------------------------------------------------------------

let refreshing: Promise<string | null> | null = null;

async function performRefresh(): Promise<string | null> {
  const refresh = await tokenStorage.getRefresh();
  if (!refresh) return null;
  try {
    const resp = await axios.post(
      `${API_BASE_URL.replace(/\/$/, '')}/token/refresh/`,
      { refresh },
      { headers: { 'Content-Type': 'application/json' }, timeout: 30000 },
    );
    const access: string = resp.data.access;
    const newRefresh: string | undefined = resp.data.refresh;
    if (newRefresh) {
      await tokenStorage.set(access, newRefresh);
    } else {
      await tokenStorage.setAccess(access);
    }
    return access;
  } catch {
    return null;
  }
}

api.interceptors.response.use(
  (resp) => resp,
  async (error: AxiosError) => {
    const original = error.config as AxiosRequestConfig & { _retry?: boolean };
    if (!original || error.response?.status !== 401 || original._retry) {
      return Promise.reject(error);
    }
    // Não tentar refresh nas próprias rotas de auth (evita loop)
    if (
      original.url &&
      (original.url.includes('/token/') || original.url.endsWith('/login/'))
    ) {
      return Promise.reject(error);
    }

    original._retry = true;
    if (!refreshing) {
      refreshing = performRefresh().finally(() => {
        refreshing = null;
      });
    }
    const newAccess = await refreshing;
    if (!newAccess) {
      callbacks.onAuthError?.();
      return Promise.reject(error);
    }
    original.headers = {
      ...(original.headers || {}),
      Authorization: `Bearer ${newAccess}`,
    };
    return api(original);
  },
);

export default api;
