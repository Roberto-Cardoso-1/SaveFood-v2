import { useUiStore } from '../store/useUiStore';
import { darkTheme, lightTheme, Theme } from '../theme/colors';

export function useTheme(): Theme {
  const isDarkMode = useUiStore((s) => s.isDarkMode);
  return isDarkMode ? darkTheme : lightTheme;
}
