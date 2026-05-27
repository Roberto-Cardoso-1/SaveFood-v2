/**
 * Tokens de cor do SaveFood.
 *
 * Mantém a identidade verde do app, e dá origem a `useTheme()` para que as
 * telas não precisem mais escrever `bg-[#0F172A]` e `text-gray-900` espalhados
 * pelo código.
 */

export const palette = {
  // Verde da marca
  brand: '#10B981',
  brandDark: '#0F9B6E',
  brandSoft: '#D1FAE5',

  // Neutros — light
  white: '#FFFFFF',
  gray50: '#F9FAFB',
  gray100: '#F3F4F6',
  gray200: '#E5E7EB',
  gray300: '#D1D5DB',
  gray400: '#9CA3AF',
  gray500: '#6B7280',
  gray700: '#374151',
  gray900: '#111827',

  // Neutros — dark (slate)
  slate900: '#0F172A',
  slate800: '#1E293B',
  slate700: '#334155',
  slate600: '#475569',
  slate400: '#94A3B8',
  slate300: '#CBD5E1',

  // Semânticos
  red: '#EF4444',
  redSoft: '#FEE2E2',
  amber: '#FBBF24',
  blue: '#3B82F6',
  orange: '#F97316',
} as const;

export type Theme = {
  isDark: boolean;
  bg: string;
  bgSubtle: string;
  card: string;
  border: string;
  text: string;
  textMuted: string;
  textOnBrand: string;
  brand: string;
  brandSubtle: string;
  danger: string;
  inputBg: string;
  inputBorder: string;
  icon: string;
  iconMuted: string;
  overlay: string;
};

export const lightTheme: Theme = {
  isDark: false,
  bg: palette.white,
  bgSubtle: palette.gray50,
  card: palette.white,
  border: palette.gray100,
  text: palette.gray900,
  textMuted: palette.gray500,
  textOnBrand: palette.white,
  brand: palette.brand,
  brandSubtle: palette.brandSoft,
  danger: palette.red,
  inputBg: palette.gray50,
  inputBorder: palette.gray100,
  icon: palette.gray900,
  iconMuted: palette.gray400,
  overlay: 'rgba(0, 0, 0, 0.5)',
};

export const darkTheme: Theme = {
  isDark: true,
  bg: palette.slate900,
  bgSubtle: palette.slate800,
  card: palette.slate800,
  border: palette.slate700,
  text: palette.white,
  textMuted: palette.slate400,
  textOnBrand: palette.white,
  brand: palette.brand,
  brandSubtle: 'rgba(16, 185, 129, 0.15)',
  danger: palette.red,
  inputBg: palette.slate800,
  inputBorder: palette.slate700,
  icon: palette.white,
  iconMuted: palette.slate600,
  overlay: 'rgba(0, 0, 0, 0.65)',
};
