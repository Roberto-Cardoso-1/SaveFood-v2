import axios, { AxiosError, AxiosRequestConfig } from 'axios';
import { tokenStorage } from './tokenStorage';

const FALLBACK_URL = 'https://savefood-api.onrender.com/api/';

export const API_BASE_URL =
  (process.env.EXPO_PUBLIC_API_URL as string | undefined) || FALLBACK_URL;

export { tokenStorage };

type AuthCallbacks = {
  onAuthError?: () => void;
};
let callbacks: AuthCallbacks = {};
export function setAuthCallbacks(cb: AuthCallbacks) {
  callbacks = { ...callbacks, ...cb };
}

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000,
  headers: {
    Accept: 'application/json',
  },
});

api.interceptors.request.use(async (config) => {
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

let refreshing: Promise<string | null> | null = null;

async function performRefresh(): Promise<string | null> {
  const refresh = await tokenStorage.getRefresh();
  if (!refresh) return null;
  try {
    const resp = await axios.post(
      `${API_BASE_URL.replace(/\/$/, '')}/token/refresh/`,
      { refresh },
      { headers: { 'Content-Type': 'application/json' }, timeout: 60000 },
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
