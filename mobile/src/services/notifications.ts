import api from './api';

export interface ApiNotificacao {
  id: number;
  tipo: 'alerta' | 'ranking' | 'impacto' | 'mensagem';
  titulo: string;
  mensagem: string;
  lida: boolean;
  created_at: string;
}

interface PaginatedResult<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

function unwrap<T>(data: PaginatedResult<T> | T[]): T[] {
  return Array.isArray(data) ? data : data.results;
}

export const notificationsService = {
  async list(): Promise<ApiNotificacao[]> {
    const resp = await api.get<PaginatedResult<ApiNotificacao> | ApiNotificacao[]>('notificacoes/');
    return unwrap(resp.data);
  },

  async markRead(id: number): Promise<void> {
    await api.post(`notificacoes/${id}/marcar-lida/`);
  },

  async markAllRead(): Promise<void> {
    await api.post('notificacoes/marcar-todas-lidas/');
  },
};
