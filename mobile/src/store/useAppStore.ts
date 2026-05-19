import { create } from 'zustand';
import api from '../services/api';

export interface User {
  id?: number;
  name: string;
  email: string;
  avatar?: string;
  tipo_perfil?: string;
}

export const BRAZIL_LOCATIONS = [
  {
    state: 'São Paulo',
    cities: ['São Paulo', 'Campinas', 'Santos', 'Ribeirão Preto', 'Sorocaba'],
  },
  {
    state: 'Rio de Janeiro',
    cities: ['Rio de Janeiro', 'Niterói', 'Búzios', 'Angra dos Reis', 'Petrópolis'],
  },
  {
    state: 'Minas Gerais',
    cities: ['Belo Horizonte', 'Uberlândia', 'Ouro Preto', 'Tiradentes', 'Juiz de Fora'],
  },
  {
    state: 'Paraná',
    cities: ['Curitiba', 'Londrina', 'Maringá', 'Foz do Iguaçu', 'Cascavel'],
  },
  {
    state: 'Bahia',
    cities: ['Salvador', 'Porto Seguro', 'Feira de Santana', 'Ilhéus', 'Vitória da Conquista', 'Itabuna'],
  },
  {
    state: 'Santa Catarina',
    cities: ['Florianópolis', 'Blumenau', 'Joinville', 'Balneário Camboriú', 'Chapecó'],
  },
  {
    state: 'Rio Grande do Sul',
    cities: ['Porto Alegre', 'Gramado', 'Caxias do Sul', 'Pelotas', 'Santa Maria'],
  },
  {
    state: 'Ceará',
    cities: ['Fortaleza', 'Juazeiro do Norte', 'Sobral', 'Jericoacoara', 'Canindé'],
  },
  {
    state: 'Pernambuco',
    cities: ['Recife', 'Olinda', 'Caruaru', 'Petrolina', 'Porto de Galinhas'],
  },
  {
    state: 'Distrito Federal',
    cities: ['Brasília', 'Taguatinga', 'Ceilândia', 'Águas Claras', 'Gama'],
  },
  {
    state: 'Goiás',
    cities: ['Goiânia', 'Anápolis', 'Aparecida de Goiânia', 'Caldas Novas', 'Pirenópolis'],
  },
  {
    state: 'Amazonas',
    cities: ['Manaus', 'Parintins', 'Itacoatiara', 'Manacapuru', 'Tefé'],
  },
  {
    state: 'Espírito Santo',
    cities: ['Vitória', 'Vila Velha', 'Serra', 'Cariacica', 'Guarapari'],
  },
  {
    state: 'Mato Grosso',
    cities: ['Cuiabá', 'Várzea Grande', 'Rondonópolis', 'Sinop', 'Tangará da Serra'],
  },
];

export interface Donation {
  id: string;
  titulo: string;
  quantidade: string;
  estabelecimento: string;
  distancia: string;
  tempoExpiracao: string;
  categoria: string;
  imagem?: string;
}

interface AppState {
  user: User | null;
  donations: Donation[];
  localizacao: string;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  setLocalizacao: (local: string) => void;
  setUser: (user: User | null) => void;
  updateUser: (data: Partial<User>) => void;
  socialLogin: (provider: string) => void;
  logout: () => void;
  fetchDonations: () => Promise<void>;
  addDonation: (item: Omit<Donation, 'id' | 'estabelecimento' | 'distancia' | 'tempoExpiracao'>) => void;
  removeDonation: (id: string) => void;
}

export const useAppStore = create<AppState>((set) => ({
  user: null,
  localizacao: 'São Paulo, BR',
  isDarkMode: false,
  donations: [],
  toggleDarkMode: () => set((state) => ({ isDarkMode: !state.isDarkMode })),
  setLocalizacao: (local) => set({ localizacao: local }),
  setUser: (user) => set({ user }),
  updateUser: (data) => set((state) => ({ user: state.user ? { ...state.user, ...data } : null })),
  socialLogin: (provider: string) => 
    set({ user: { name: `Usuário ${provider}`, email: `${provider.toLowerCase()}@teste.com`, avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400' } }),
  logout: () => set({ user: null }),
  fetchDonations: async () => {
    try {
      const response = await api.get('doacoes/');
      const apiDonations = response.data.map((d: any) => {
        let imageUrl = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=500&q=60';
        if (d.imagem) {
          const baseUrl = api.defaults.baseURL.replace('/api/', '');
          imageUrl = d.imagem.startsWith('http') ? d.imagem : `${baseUrl}${d.imagem}`;
        }
        
        return {
          id: d.id.toString(),
          titulo: d.produto,
          quantidade: d.quantidade.toString(),
          estabelecimento: d.estabelecimento || 'Doador Local',
          distancia: 'Aprox. 1km',
          tempoExpiracao: '24h',
          categoria: (d.categoria || 'Outros').trim(),
          imagem: imageUrl,
          descricao: d.descricao,
          validade: d.validade,
        };
      });
      set({ donations: apiDonations });
    } catch (error) {
      console.error('Erro ao buscar doações:', error);
    }
  },
  addDonation: (item) => 
    set((state) => ({
      donations: [
        {
          ...item,
          id: Math.random().toString(36).substring(7),
          estabelecimento: 'Minha Doação',
          distancia: '0m',
          tempoExpiracao: '24h',
          imagem: item.imagem || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=500&q=60',
        },
        ...state.donations,
      ],
    })),
  removeDonation: (id) => 
    set((state) => ({
      donations: state.donations.filter((d) => d.id !== id),
    })),
}));
