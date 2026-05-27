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
  error: 'denied' | 'unavailable' | null;
}

export function useUserLocation(autoStart = true) {
  const [state, setState] = useState<State>({
    coords: null,
    loading: false,
    error: null,
  });

  const refresh = useCallback(async () => {
    setState((s) => ({ ...s, loading: true, error: null }));

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
      }

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
