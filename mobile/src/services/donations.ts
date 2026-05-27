import api, { API_BASE_URL } from './api';

export interface ApiDonation {
  id: number;
  produto: string;
  descricao?: string;
  categoria: string;
  quantidade: number;
  validade: string;
  status: string;
  imagem?: string | null;
  /** Backend devolve string decimal ("-23.550500") ou null. */
  latitude?: string | null;
  longitude?: string | null;
  doador_id: number;
  receptor_id?: number | null;
  estabelecimento: string;
  created_at: string;
  updated_at: string;
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

export const donationsService = {
  async list(): Promise<{ items: ApiDonation[]; apiBase: string }> {
    const resp = await api.get<PaginatedResult<ApiDonation> | ApiDonation[]>('doacoes/');
    return { items: unwrap(resp.data), apiBase: API_BASE_URL };
  },

  async myDonations(): Promise<ApiDonation[]> {
    const resp = await api.get<PaginatedResult<ApiDonation> | ApiDonation[]>('doacoes/minhas/');
    return unwrap(resp.data);
  },

  async receivedDonations(): Promise<ApiDonation[]> {
    const resp = await api.get<PaginatedResult<ApiDonation> | ApiDonation[]>('doacoes/recebidas/');
    return unwrap(resp.data);
  },

  async create(args: {
    produto: string;
    descricao?: string;
    categoria: string;
    quantidade: number;
    validade: string; // YYYY-MM-DD
    imageUri?: string | null;
    latitude?: number | null;
    longitude?: number | null;
  }): Promise<ApiDonation> {
    const form = new FormData();
    form.append('produto', args.produto);
    form.append('descricao', args.descricao || '');
    form.append('categoria', args.categoria);
    form.append('quantidade', String(args.quantidade));
    form.append('validade', args.validade);
    if (args.latitude != null && args.longitude != null) {
      form.append('latitude', args.latitude.toFixed(6));
      form.append('longitude', args.longitude.toFixed(6));
    }

    if (args.imageUri) {
      if (args.imageUri.startsWith('blob:') || args.imageUri.startsWith('data:')) {
        const blob = await (await fetch(args.imageUri)).blob();
        form.append('imagem', blob, `donation_${Date.now()}.jpg`);
      } else {
        const ext = (args.imageUri.split('.').pop() || 'jpg').toLowerCase();
        form.append('imagem', {
          uri: args.imageUri,
          name: `donation_${Date.now()}.${ext}`,
          type: `image/${ext === 'jpg' ? 'jpeg' : ext}`,
        } as any);
      }
    }

    const resp = await api.post<ApiDonation>('doacoes/', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return resp.data;
  },

  async remove(id: number | string): Promise<void> {
    await api.delete(`doacoes/${id}/`);
  },

  async reserve(id: number | string): Promise<ApiDonation> {
    const resp = await api.post<ApiDonation>(`doacoes/${id}/reservar/`);
    return resp.data;
  },
};
