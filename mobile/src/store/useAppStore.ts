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
  socialLogin: (provider: string) => void;
  logout: () => void;
  addDonation: (item: Omit<Donation, 'id' | 'estabelecimento' | 'distancia' | 'tempoExpiracao'>) => void;
  removeDonation: (id: string) => void;
}

export const useAppStore = create<AppState>((set) => ({
  user: null,
  localizacao: 'São Paulo, BR',
  isDarkMode: false,
  donations: [
    {
      id: '1',
      titulo: 'Pão de Centeio Fresco',
      quantidade: '3',
      estabelecimento: 'Padaria Artesanal',
      distancia: '450m',
      tempoExpiracao: '2h',
      categoria: 'Padaria',
      imagem: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=500&q=60',
    },
    {
      id: '3',
      titulo: 'Iogurte Grego Natural',
      quantidade: '5',
      estabelecimento: 'Mini Mercado Plus',
      distancia: '1.2km',
      tempoExpiracao: '1h',
      categoria: 'Laticínios',
      imagem: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=500&q=60',
    },
    {
      id: '4',
      titulo: 'Marmita de Lasanha',
      quantidade: '2',
      estabelecimento: 'Restaurante Sabor',
      distancia: '1.5km',
      tempoExpiracao: '3h',
      categoria: 'Refeições',
      imagem: 'https://images.unsplash.com/photo-1574894709920-11b28e7367e3?auto=format&fit=crop&w=500&q=60',
    },
    {
      id: '5',
      titulo: 'Croissants de Chocolate',
      quantidade: '4',
      estabelecimento: 'Doce Tentação',
      distancia: '600m',
      tempoExpiracao: '4h',
      categoria: 'Doces',
      imagem: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=500&q=60',
    },
    {
      id: '6',
      titulo: 'Sopa de Legumes Caseira',
      quantidade: '3',
      estabelecimento: 'Cozinha Natural',
      distancia: '2km',
      tempoExpiracao: '2h',
      categoria: 'Refeições',
      imagem: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&w=500&q=60',
    },
    {
      id: '8',
      titulo: 'Pizza de Queijo',
      quantidade: '1',
      estabelecimento: 'Pizzaria Bella',
      distancia: '1.8km',
      tempoExpiracao: '1h',
      categoria: 'Refeições',
      imagem: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=500&q=60',
    },
    {
      id: '9',
      titulo: 'Ovos Orgânicos (dz)',
      quantidade: '2',
      estabelecimento: 'Granja do Sol',
      distancia: '3.5km',
      tempoExpiracao: '24h',
      categoria: 'Laticínios',
      imagem: 'https://images.unsplash.com/photo-1569288052389-dac9b01c9c05?auto=format&fit=crop&w=500&q=60',
    },
    {
      id: '10',
      titulo: 'Bolo de Chocolate',
      quantidade: '1',
      estabelecimento: 'Café Delícia',
      distancia: '900m',
      tempoExpiracao: '4h',
      categoria: 'Doces',
      imagem: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=500&q=60',
    },
    {
      id: '11',
      titulo: 'Morangos Frescos',
      quantidade: '3',
      estabelecimento: 'Mercado Verde',
      distancia: '1.1km',
      tempoExpiracao: '8h',
      categoria: 'Frutas',
      imagem: 'https://images.unsplash.com/photo-1464965911861-746a04b4bca6?auto=format&fit=crop&w=500&q=60',
    },
  ],
  toggleDarkMode: () => set((state) => ({ isDarkMode: !state.isDarkMode })),
  setLocalizacao: (local) => set({ localizacao: local }),
  setUser: (user) => set({ user }),
  socialLogin: (provider: string) => 
    set({ user: { name: `Usuário ${provider}`, email: `${provider.toLowerCase()}@teste.com`, avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400' } }),
  logout: () => set({ user: null }),
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
