import { create } from 'zustand';
import { notificationsService, ApiNotificacao } from '../services/notifications';

export interface Notification {
  id: number;
  tipo: 'alerta' | 'ranking' | 'impacto' | 'mensagem';
  titulo: string;
  mensagem: string;
  lida: boolean;
  createdAt: string;
}

interface NotificationsState {
  items: Notification[];
  unread: number;
  isLoading: boolean;
  fetch: () => Promise<void>;
  markRead: (id: number) => Promise<void>;
  markAllRead: () => Promise<void>;
}

function fromApi(n: ApiNotificacao): Notification {
  return {
    id: n.id,
    tipo: n.tipo,
    titulo: n.titulo,
    mensagem: n.mensagem,
    lida: n.lida,
    createdAt: n.created_at,
  };
}

export const useNotificationsStore = create<NotificationsState>((set, get) => ({
  items: [],
  unread: 0,
  isLoading: false,

  fetch: async () => {
    set({ isLoading: true });
    try {
      const items = (await notificationsService.list()).map(fromApi);
      set({
        items,
        unread: items.filter((n) => !n.lida).length,
        isLoading: false,
      });
    } catch {
      set({ isLoading: false });
    }
  },

  markRead: async (id) => {
    await notificationsService.markRead(id);
    set((s) => {
      const items = s.items.map((n) => (n.id === id ? { ...n, lida: true } : n));
      return { items, unread: items.filter((n) => !n.lida).length };
    });
  },

  markAllRead: async () => {
    await notificationsService.markAllRead();
    set((s) => ({
      items: s.items.map((n) => ({ ...n, lida: true })),
      unread: 0,
    }));
  },
}));
