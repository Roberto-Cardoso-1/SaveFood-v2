import api, { tokenStorage, setAuthCallbacks, API_BASE_URL } from './api';
import { useAuthStore, User } from '../store/useAuthStore';

interface ApiUser {
  id: number;
  nome: string;
  email: string;
  tipo_perfil: 'doador' | 'receptor';
  avatar?: string | null;
}

interface TokenResponse {
  access: string;
  refresh: string;
  user: ApiUser;
}

function absolutize(avatar?: string | null): string | undefined {
  if (!avatar) return undefined;
  if (avatar.startsWith('http')) return avatar;
  const base = API_BASE_URL.replace(/\/api\/?$/, '');
  return `${base}${avatar}`;
}

function toAppUser(u: ApiUser): User {
  return {
    id: u.id,
    name: u.nome,
    email: u.email,
    avatar: absolutize(u.avatar),
    tipo_perfil: u.tipo_perfil === 'doador' ? 'Doador' : 'Receptor',
  };
}

export const authService = {
  async login(email: string, senha: string): Promise<User> {
    const resp = await api.post<TokenResponse>('token/', { email, senha });
    const { access, refresh, user } = resp.data;
    await tokenStorage.set(access, refresh);
    const appUser = toAppUser(user);
    useAuthStore.getState().setUser(appUser);
    return appUser;
  },

  async register(args: {
    nome: string;
    email: string;
    senha: string;
    tipo_perfil: 'doador' | 'receptor';
  }): Promise<User> {
    await api.post('usuarios/', args);
    return this.login(args.email, args.senha);
  },

  async requestPasswordReset(email: string): Promise<string> {
    const resp = await api.post<{ status: string }>('usuarios/recuperar-senha/', { email });
    return resp.data.status;
  },

  async hydrate(): Promise<User | null> {
    const access = await tokenStorage.getAccess();
    if (!access) return null;
    try {
      const resp = await api.get<ApiUser>('usuarios/me/');
      const appUser = toAppUser(resp.data);
      useAuthStore.getState().setUser(appUser);
      return appUser;
    } catch {
      await tokenStorage.clear();
      useAuthStore.getState().setUser(null);
      return null;
    }
  },

  async logout(): Promise<void> {
    await tokenStorage.clear();
    useAuthStore.getState().setUser(null);
  },

  async updateProfile(args: {
    userId: number;
    nome?: string;
    avatarUri?: string | null;
    isNewAvatar?: boolean;
  }): Promise<User> {
    const { userId, nome, avatarUri, isNewAvatar } = args;
    const form = new FormData();
    if (nome != null) form.append('nome', nome);
    if (avatarUri === null) {
      form.append('avatar', '');
    } else if (avatarUri && isNewAvatar) {
      if (avatarUri.startsWith('blob:') || avatarUri.startsWith('data:')) {
        const blob = await (await fetch(avatarUri)).blob();
        form.append('avatar', blob, `avatar_${Date.now()}.jpg`);
      } else {
        const ext = (avatarUri.split('.').pop() || 'jpg').toLowerCase();
        form.append('avatar', {
          uri: avatarUri,
          name: `avatar_${Date.now()}.${ext}`,
          type: `image/${ext === 'jpg' ? 'jpeg' : ext}`,
        } as any);
      }
    }
    const resp = await api.post<ApiUser>(`usuarios/${userId}/atualizar_perfil/`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    const appUser = toAppUser(resp.data);
    useAuthStore.getState().updateUser({
      name: appUser.name,
      avatar: appUser.avatar,
    });
    return appUser;
  },
};

setAuthCallbacks({
  onAuthError: () => {
    void authService.logout();
  },
});
