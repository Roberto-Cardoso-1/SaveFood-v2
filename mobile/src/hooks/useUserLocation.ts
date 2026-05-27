import { useCallback, useEffect, useState } from 'react';
import * as Location from 'expo-location';
import { Platform } from 'react-native';

export interface Coords {
  latitude: number;
  longitude: number;
}

interface State {
  coords: Coords | null;
  loading: boolean;
  /**
   * - `denied`: usuário recusou a permissão.
   * - `unavailable`: permissão concedida mas o GPS não retornou (sem sinal,
   *   modo avião, ou ambiente sem suporte como Expo Web).
   * - `null`: estado normal.
   */
  error: 'denied' | 'unavailable' | null;
}

/**
 * Pede permissão de localização e devolve as coordenadas atuais do usuário.
 *
 * Estratégia:
 * 1. Tenta `getLastKnownPositionAsync` primeiro (cache do SO, ~instantâneo).
 * 2. Em paralelo dispara `getCurrentPositionAsync` para atualizar com leitura
 *    fresca quando chegar.
 *
 * Se `autoStart=false`, a leitura só dispara quando você chamar `refresh()`.
 *
 * Em Expo Web e em emuladores sem GPS configurado, costuma cair em
 * `unavailable` — a UI deve mostrar um fallback (ex: centralizar em SP).
 */
export function useUserLocation(autoStart = true) {
  const [state, setState] = useState<State>({
    coords: null,
    loading: false,
    error: null,
  });

  const refresh = useCallback(async () => {
    setState((s) => ({ ...s, loading: true, error: null }));

    // Web: `expo-location` funciona mas exige HTTPS e permissão do navegador.
    // Em desenvolvimento via `expo start --web` no localhost geralmente roda.
    if (Platform.OS === 'web' && typeof navigator !== 'undefined' && !navigator.geolocation) {
      setState({ coords: null, loading: false, error: 'unavailable' });
      return;
    }

    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setState({ coords: null, loading: false, error: 'denied' });
        return;
      }

      // 1) cache (rápido)
      try {
        const last = await Location.getLastKnownPositionAsync({});
        if (last) {
          setState({
            coords: { latitude: last.coords.latitude, longitude: last.coords.longitude },
            loading: false,
            error: null,
          });
        }
      } catch {
        /* ignora — vamos tentar fresca abaixo */
      }

      // 2) leitura fresca (substitui o cache quando chegar)
      const fresh = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      setState({
        coords: { latitude: fresh.coords.latitude, longitude: fresh.coords.longitude },
        loading: false,
        error: null,
      });
    } catch {
      setState((s) => ({
        ...s,
        loading: false,
        // Se não temos coords nem do cache nem da leitura fresca, marca unavailable.
        error: s.coords ? null : 'unavailable',
      }));
    }
  }, []);

  useEffect(() => {
    if (autoStart) {
      void refresh();
    }
  }, [autoStart, refresh]);

  return { ...state, refresh };
}
