import { useUiStore } from '../store/useUiStore';
import { darkTheme, lightTheme, Theme } from '../theme/colors';

/**
 * Hook único de tema. Reflete a flag `isDarkMode` da store de UI.
 *
 * Uso:
 *   const t = useTheme();
 *   <View style={{ backgroundColor: t.bg }}>...</View>
 */
export function useTheme(): Theme {
  const isDarkMode = useUiStore((s) => s.isDarkMode);
  return isDarkMode ? darkTheme : lightTheme;
}
