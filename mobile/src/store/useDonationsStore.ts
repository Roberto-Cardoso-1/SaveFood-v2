import { create } from 'zustand';
import { donationsService, ApiDonation } from '../services/donations';

export interface Donation {
  id: string;
  titulo: string;
  quantidade: string;
  estabelecimento: string;
  distancia: string;
  tempoExpiracao: string;
  categoria: string;
  imagem?: string;
  descricao?: string;
  validade?: string;
  status?: string;
  doadorId?: number;
  /** number | undefined — parseados da string decimal vinda do backend. */
  latitude?: number;
  longitude?: number;
}

interface DonationsState {
  donations: Donation[];
  isLoading: boolean;
  error: string | null;
  fetchDonations: () => Promise<void>;
  removeLocal: (id: string) => void;
  upsertLocal: (d: Donation) => void;
}

function mapApi(d: ApiDonation, apiBase: string): Donation {
  const fallbackImg =
    'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=500&q=60';

  let imageUrl = fallbackImg;
  if (d.imagem) {
    if (d.imagem.startsWith('http')) {
      imageUrl = d.imagem;
    } else {
      const base = apiBase.replace(/\/api\/?$/, '');
      imageUrl = `${base}${d.imagem}`;
    }
  }

  const lat = d.latitude != null ? Number(d.latitude) : undefined;
  const lng = d.longitude != null ? Number(d.longitude) : undefined;

  return {
    id: String(d.id),
    titulo: d.produto,
    quantidade: String(d.quantidade),
    estabelecimento: d.estabelecimento || 'Doador Local',
    distancia: 'Aprox. 1km',
    tempoExpiracao: '24h',
    categoria: (d.categoria || 'Outros').trim(),
    imagem: imageUrl,
    descricao: d.descricao,
    validade: d.validade,
    status: d.status,
    doadorId: d.doador_id,
    latitude: Number.isFinite(lat) ? lat : undefined,
    longitude: Number.isFinite(lng) ? lng : undefined,
  };
}

export const useDonationsStore = create<DonationsState>((set, get) => ({
  donations: [],
  isLoading: false,
  error: null,

  fetchDonations: async () => {
    set({ isLoading: true, error: null });
    try {
      const { items, apiBase } = await donationsService.list();
      set({
        donations: items.map((d) => mapApi(d, apiBase)),
        isLoading: false,
      });
    } catch (err: any) {
      set({
        isLoading: false,
        error: err?.response?.data?.detail || 'Erro ao buscar doações.',
      });
    }
  },

  removeLocal: (id) =>
    set((s) => ({ donations: s.donations.filter((d) => d.id !== id) })),

  upsertLocal: (donation) =>
    set((s) => {
      const exists = s.donations.find((d) => d.id === donation.id);
      if (exists) {
        return { donations: s.donations.map((d) => (d.id === donation.id ? donation : d)) };
      }
      return { donations: [donation, ...s.donations] };
    }),
}));
