import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export const BRAZIL_LOCATIONS = [
  { state: 'São Paulo', cities: ['São Paulo', 'Campinas', 'Santos', 'Ribeirão Preto', 'Sorocaba'] },
  { state: 'Rio de Janeiro', cities: ['Rio de Janeiro', 'Niterói', 'Búzios', 'Angra dos Reis', 'Petrópolis'] },
  { state: 'Minas Gerais', cities: ['Belo Horizonte', 'Uberlândia', 'Ouro Preto', 'Tiradentes', 'Juiz de Fora'] },
  { state: 'Paraná', cities: ['Curitiba', 'Londrina', 'Maringá', 'Foz do Iguaçu', 'Cascavel'] },
  { state: 'Bahia', cities: ['Salvador', 'Porto Seguro', 'Feira de Santana', 'Ilhéus', 'Vitória da Conquista', 'Itabuna'] },
  { state: 'Santa Catarina', cities: ['Florianópolis', 'Blumenau', 'Joinville', 'Balneário Camboriú', 'Chapecó'] },
  { state: 'Rio Grande do Sul', cities: ['Porto Alegre', 'Gramado', 'Caxias do Sul', 'Pelotas', 'Santa Maria'] },
  { state: 'Ceará', cities: ['Fortaleza', 'Juazeiro do Norte', 'Sobral', 'Jericoacoara', 'Canindé'] },
  { state: 'Pernambuco', cities: ['Recife', 'Olinda', 'Caruaru', 'Petrolina', 'Porto de Galinhas'] },
  { state: 'Distrito Federal', cities: ['Brasília', 'Taguatinga', 'Ceilândia', 'Águas Claras', 'Gama'] },
  { state: 'Goiás', cities: ['Goiânia', 'Anápolis', 'Aparecida de Goiânia', 'Caldas Novas', 'Pirenópolis'] },
  { state: 'Amazonas', cities: ['Manaus', 'Parintins', 'Itacoatiara', 'Manacapuru', 'Tefé'] },
  { state: 'Espírito Santo', cities: ['Vitória', 'Vila Velha', 'Serra', 'Cariacica', 'Guarapari'] },
  { state: 'Mato Grosso', cities: ['Cuiabá', 'Várzea Grande', 'Rondonópolis', 'Sinop', 'Tangará da Serra'] },
] as const;

interface UiState {
  isDarkMode: boolean;
  localizacao: string;
  pushEnabled: boolean;
  locationEnabled: boolean;
  toggleDarkMode: () => void;
  setLocalizacao: (loc: string) => void;
  setPushEnabled: (v: boolean) => void;
  setLocationEnabled: (v: boolean) => void;
}

export const useUiStore = create<UiState>()(
  persist(
    (set) => ({
      isDarkMode: false,
      localizacao: 'São Paulo, BR',
      pushEnabled: true,
      locationEnabled: true,
      toggleDarkMode: () => set((s) => ({ isDarkMode: !s.isDarkMode })),
      setLocalizacao: (loc) => set({ localizacao: loc }),
      setPushEnabled: (v) => set({ pushEnabled: v }),
      setLocationEnabled: (v) => set({ locationEnabled: v }),
    }),
    {
      name: 'savefood:ui',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
