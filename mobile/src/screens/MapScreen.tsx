import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Dimensions,
  Animated,
  TextInput,
  Alert,
  ActivityIndicator,
  StyleSheet,
  Platform,
  Linking,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MapView, { Marker, PROVIDER_DEFAULT, Region } from 'react-native-maps';
import {
  Search,
  Navigation,
  Star,
  X,
  Store,
  Info,
  CheckCircle2,
  ShoppingBag,
  Leaf,
  Box,
  Sparkles,
  MapPin,
  Compass,
  AlertCircle,
  LucideIcon,
} from 'lucide-react-native';
import { BottomTabBar } from '../components/BottomTabBar';
import { useDonationsStore, Donation } from '../store/useDonationsStore';
import { useAuthStore } from '../store/useAuthStore';
import { donationsService } from '../services/donations';
import { useTheme } from '../hooks/useTheme';
import { useUserLocation } from '../hooks/useUserLocation';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

// Fallback: São Paulo Centro (Praça da Sé). Usado se o GPS for negado/indisponível.
const FALLBACK_REGION: Region = {
  latitude: -23.5505,
  longitude: -46.6333,
  latitudeDelta: 0.05,
  longitudeDelta: 0.05,
};

const CATEGORY_FILTERS: { name: string; icon: LucideIcon }[] = [
  { name: 'Todos', icon: Sparkles },
  { name: 'Padaria', icon: Store },
  { name: 'Frutas', icon: Leaf },
  { name: 'Refeições', icon: ShoppingBag },
  { name: 'Doces', icon: Star },
  { name: 'Laticínios', icon: Box },
  { name: 'Outros', icon: Sparkles },
];

const CATEGORY_ICONS: Record<string, LucideIcon> = {
  Padaria: Store,
  Frutas: Leaf,
  Refeições: ShoppingBag,
  Doces: Star,
  Laticínios: Box,
  Outros: Sparkles,
};

/** Estilo de mapa em dark mode (versão enxuta — só água/labels/ruas). */
const DARK_MAP_STYLE = [
  { elementType: 'geometry', stylers: [{ color: '#1E293B' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#94A3B8' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#0F172A' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#334155' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#0F172A' }] },
  { featureType: 'poi', elementType: 'labels', stylers: [{ visibility: 'off' }] },
];

/** Haversine simplificado — distância em km entre dois pontos lat/lng. */
function haversineKm(
  a: { latitude: number; longitude: number },
  b: { latitude: number; longitude: number },
): number {
  const R = 6371;
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(b.latitude - a.latitude);
  const dLon = toRad(b.longitude - a.longitude);
  const lat1 = toRad(a.latitude);
  const lat2 = toRad(b.latitude);
  const h =
    Math.sin(dLat / 2) ** 2 + Math.sin(dLon / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2);
  return 2 * R * Math.asin(Math.sqrt(h));
}

function formatDistance(km: number): string {
  if (km < 1) return `${Math.round(km * 1000)} m`;
  if (km < 10) return `${km.toFixed(1)} km`;
  return `${Math.round(km)} km`;
}

/** Marker verde com ícone da categoria. Escala maior quando selecionado. */
function CustomMarker({
  categoria,
  selected,
}: {
  categoria: string;
  selected: boolean;
}) {
  const Icon = CATEGORY_ICONS[categoria] || Sparkles;
  return (
    <View style={{ alignItems: 'center' }}>
      <View
        style={{
          width: selected ? 52 : 40,
          height: selected ? 52 : 40,
          borderRadius: selected ? 18 : 14,
          backgroundColor: selected ? '#059669' : '#10B981',
          alignItems: 'center',
          justifyContent: 'center',
          borderWidth: 3,
          borderColor: 'white',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.3,
          shadowRadius: 4,
          elevation: 5,
        }}
      >
        <Icon size={selected ? 26 : 20} color="white" strokeWidth={2.5} />
      </View>
      {/* Pino apontando pra baixo */}
      <View
        style={{
          width: 0,
          height: 0,
          borderLeftWidth: 6,
          borderRightWidth: 6,
          borderTopWidth: 8,
          borderLeftColor: 'transparent',
          borderRightColor: 'transparent',
          borderTopColor: selected ? '#059669' : '#10B981',
          marginTop: -2,
        }}
      />
    </View>
  );
}

const MapScreen = () => {
  const t = useTheme();
  const user = useAuthStore((s) => s.user);
  const { donations, fetchDonations } = useDonationsStore();
  const {
    coords,
    error: locationError,
    refresh: refreshLocation,
    loading: locationLoading,
  } = useUserLocation();

  const mapRef = useRef<MapView | null>(null);
  const [selected, setSelected] = useState<Donation | null>(null);
  const [category, setCategory] = useState('Todos');
  const [searchQuery, setSearchQuery] = useState('');
  const [isReserving, setIsReserving] = useState(false);
  const [showCatBar, setShowCatBar] = useState(true);

  const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const initialRegionRef = useRef<Region>(FALLBACK_REGION);

  useEffect(() => {
    fetchDonations();
  }, [fetchDonations]);

  // Anima o mapa para a posição real quando o GPS chega.
  useEffect(() => {
    if (coords && mapRef.current) {
      mapRef.current.animateToRegion(
        {
          latitude: coords.latitude,
          longitude: coords.longitude,
          latitudeDelta: 0.03,
          longitudeDelta: 0.03,
        },
        600,
      );
    }
  }, [coords]);

  // Bottom sheet anima quando selected muda.
  useEffect(() => {
    Animated.spring(slideAnim, {
      toValue: selected ? 0 : SCREEN_HEIGHT,
      useNativeDriver: true,
      tension: 60,
      friction: 10,
    }).start();
  }, [selected, slideAnim]);

  // Filtros: categoria + busca + tem lat/lng.
  const visibleDonations = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return donations.filter((d) => {
      if (d.latitude == null || d.longitude == null) return false;
      if (category !== 'Todos' && d.categoria.trim() !== category) return false;
      if (
        q &&
        !d.titulo.toLowerCase().includes(q) &&
        !d.estabelecimento.toLowerCase().includes(q)
      ) {
        return false;
      }
      return true;
    });
  }, [donations, category, searchQuery]);

  const selectedDistanceKm = useMemo(() => {
    if (selected?.latitude == null || selected?.longitude == null || !coords) return null;
    return haversineKm(coords, {
      latitude: selected.latitude,
      longitude: selected.longitude,
    });
  }, [selected, coords]);

  const handleSelectMarker = (d: Donation) => {
    setSelected(d);
    if (d.latitude != null && d.longitude != null && mapRef.current) {
      mapRef.current.animateToRegion(
        {
          latitude: d.latitude,
          longitude: d.longitude,
          latitudeDelta: 0.015,
          longitudeDelta: 0.015,
        },
        500,
      );
    }
  };

  const handleRecenter = async () => {
    if (coords && mapRef.current) {
      mapRef.current.animateToRegion(
        {
          latitude: coords.latitude,
          longitude: coords.longitude,
          latitudeDelta: 0.03,
          longitudeDelta: 0.03,
        },
        600,
      );
    } else {
      await refreshLocation();
    }
  };

  const handleOpenDirections = () => {
    if (selected?.latitude == null || selected?.longitude == null) return;
    const lat = selected.latitude;
    const lng = selected.longitude;
    const url = Platform.select({
      ios: `http://maps.apple.com/?daddr=${lat},${lng}&dirflg=d`,
      android: `google.navigation:q=${lat},${lng}`,
      default: `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`,
    });
    Linking.openURL(url!).catch(() => {
      Alert.alert('Erro', 'Não foi possível abrir o aplicativo de mapas.');
    });
  };

  const handleReservar = async () => {
    if (!selected || !user) return;
    if (user.tipo_perfil !== 'Receptor') {
      Alert.alert(
        'Ação restrita',
        'Apenas usuários do tipo Receptor podem reservar doações.',
      );
      return;
    }
    if (selected.doadorId === user.id) {
      Alert.alert('Ação inválida', 'Você não pode reservar sua própria doação.');
      return;
    }
    setIsReserving(true);
    try {
      await donationsService.reserve(selected.id);
      await fetchDonations();
      Alert.alert('Reservado!', 'Sua reserva foi confirmada. O doador foi notificado.');
      setSelected(null);
    } catch (err: any) {
      const data = err?.response?.data;
      const msg = data?.error || data?.detail || 'Não foi possível concluir a reserva.';
      Alert.alert('Erro', msg);
    } finally {
      setIsReserving(false);
    }
  };

  const showWebFallback = Platform.OS === 'web';

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: t.bg }} edges={['top']}>
      {showWebFallback ? (
        <View
          style={{
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
            padding: 32,
          }}
        >
          <View
            style={{
              width: 80,
              height: 80,
              borderRadius: 24,
              backgroundColor: t.brandSubtle,
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 24,
            }}
          >
            <Compass size={40} color={t.brand} />
          </View>
          <Text
            style={{
              color: t.text,
              fontWeight: '900',
              fontSize: 22,
              textAlign: 'center',
            }}
          >
            Mapa disponível só no app
          </Text>
          <Text
            style={{
              color: t.textMuted,
              marginTop: 12,
              textAlign: 'center',
              lineHeight: 22,
            }}
          >
            Abra o SaveFood no celular (Expo Go ou APK) para ver o mapa interativo com as
            doações próximas em tempo real.
          </Text>
        </View>
      ) : (
        <View style={{ flex: 1 }}>
          <MapView
            ref={mapRef}
            style={StyleSheet.absoluteFill}
            provider={PROVIDER_DEFAULT}
            initialRegion={initialRegionRef.current}
            showsUserLocation
            showsMyLocationButton={false}
            showsCompass={false}
            customMapStyle={t.isDark ? DARK_MAP_STYLE : []}
            onPress={() => setSelected(null)}
          >
            {visibleDonations.map((d) => (
              <Marker
                key={d.id}
                coordinate={{ latitude: d.latitude!, longitude: d.longitude! }}
                onPress={(e) => {
                  e.stopPropagation();
                  handleSelectMarker(d);
                }}
                tracksViewChanges={selected?.id === d.id}
              >
                <CustomMarker categoria={d.categoria} selected={selected?.id === d.id} />
              </Marker>
            ))}
          </MapView>

          {/* 🔍 Search + filtros overlay */}
          <View style={{ position: 'absolute', top: 12, left: 16, right: 16, zIndex: 50 }}>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: t.isDark
                  ? 'rgba(30,41,59,0.95)'
                  : 'rgba(255,255,255,0.97)',
                borderRadius: 24,
                paddingHorizontal: 20,
                paddingVertical: 14,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.15,
                shadowRadius: 8,
                elevation: 6,
                borderWidth: 1,
                borderColor: t.border,
              }}
            >
              <Search size={20} color={t.brand} />
              <TextInput
                style={{
                  flex: 1,
                  marginLeft: 12,
                  color: t.text,
                  fontWeight: '600',
                  fontSize: 15,
                }}
                placeholder="Buscar produto ou lugar..."
                placeholderTextColor={t.textMuted}
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
              <TouchableOpacity
                onPress={() => setShowCatBar((v) => !v)}
                style={{
                  marginLeft: 8,
                  width: 32,
                  height: 32,
                  borderRadius: 12,
                  backgroundColor: showCatBar ? t.brand : t.bgSubtle,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Sparkles
                  size={16}
                  color={showCatBar ? 'white' : t.iconMuted}
                  fill={showCatBar ? 'white' : 'none'}
                />
              </TouchableOpacity>
            </View>

            {showCatBar && (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingTop: 10, paddingRight: 16 }}
                style={{ marginHorizontal: -16, paddingLeft: 16 }}
              >
                {CATEGORY_FILTERS.map((cat) => {
                  const Icon = cat.icon;
                  const isActive = category === cat.name;
                  return (
                    <TouchableOpacity
                      key={cat.name}
                      onPress={() => setCategory(cat.name)}
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        paddingHorizontal: 14,
                        paddingVertical: 9,
                        borderRadius: 18,
                        marginRight: 8,
                        backgroundColor: isActive
                          ? t.brand
                          : t.isDark
                            ? 'rgba(30,41,59,0.95)'
                            : 'rgba(255,255,255,0.97)',
                        borderWidth: 1,
                        borderColor: isActive ? t.brand : t.border,
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.08,
                        shadowRadius: 3,
                        elevation: 2,
                      }}
                    >
                      <Icon size={14} color={isActive ? 'white' : t.brand} />
                      <Text
                        style={{
                          marginLeft: 6,
                          fontSize: 11,
                          fontWeight: '900',
                          letterSpacing: 0.5,
                          textTransform: 'uppercase',
                          color: isActive ? 'white' : t.textMuted,
                        }}
                      >
                        {cat.name}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            )}
          </View>

          {/* 📍 Banner permissão negada */}
          {locationError === 'denied' && (
            <View
              style={{
                position: 'absolute',
                top: showCatBar ? 130 : 80,
                left: 16,
                right: 16,
                zIndex: 40,
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: '#FEF3C7',
                borderRadius: 16,
                padding: 12,
                borderWidth: 1,
                borderColor: '#FCD34D',
              }}
            >
              <AlertCircle size={18} color="#D97706" />
              <Text
                style={{
                  flex: 1,
                  marginLeft: 10,
                  fontSize: 12,
                  color: '#92400E',
                  fontWeight: '600',
                }}
              >
                Sem acesso à localização. Doações sendo mostradas em SP.
              </Text>
              <TouchableOpacity onPress={refreshLocation}>
                <Text style={{ color: '#D97706', fontWeight: '900', fontSize: 11 }}>
                  TENTAR
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {/* 🎯 Recenter */}
          <TouchableOpacity
            onPress={handleRecenter}
            disabled={locationLoading}
            style={{
              position: 'absolute',
              bottom: 130,
              right: 20,
              width: 56,
              height: 56,
              borderRadius: 18,
              backgroundColor: t.brand,
              alignItems: 'center',
              justifyContent: 'center',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.25,
              shadowRadius: 6,
              elevation: 8,
              zIndex: 40,
            }}
          >
            {locationLoading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Navigation size={22} color="white" fill="white" />
            )}
          </TouchableOpacity>

          {/* 🔢 Contador */}
          <View
            style={{
              position: 'absolute',
              bottom: 130,
              left: 20,
              backgroundColor: t.isDark
                ? 'rgba(30,41,59,0.95)'
                : 'rgba(255,255,255,0.97)',
              paddingHorizontal: 14,
              paddingVertical: 10,
              borderRadius: 18,
              borderWidth: 1,
              borderColor: t.border,
              flexDirection: 'row',
              alignItems: 'center',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 4,
              elevation: 4,
              zIndex: 40,
            }}
          >
            <MapPin size={14} color={t.brand} />
            <Text
              style={{ marginLeft: 6, color: t.text, fontWeight: '900', fontSize: 13 }}
            >
              {visibleDonations.length}
            </Text>
            <Text
              style={{
                marginLeft: 4,
                color: t.textMuted,
                fontSize: 11,
                fontWeight: '700',
              }}
            >
              {visibleDonations.length === 1 ? 'doação' : 'doações'}
            </Text>
          </View>

          {/* 📋 Bottom sheet */}
          <Animated.View
            style={{
              position: 'absolute',
              bottom: 100,
              left: 12,
              right: 12,
              zIndex: 100,
              transform: [{ translateY: slideAnim }],
            }}
          >
            {selected && (
              <View
                style={{
                  backgroundColor: t.isDark
                    ? 'rgba(30,41,59,0.97)'
                    : 'rgba(255,255,255,0.98)',
                  borderRadius: 28,
                  padding: 24,
                  borderWidth: 1,
                  borderColor: t.border,
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 8 },
                  shadowOpacity: 0.2,
                  shadowRadius: 16,
                  elevation: 12,
                }}
              >
                <View
                  style={{
                    width: 40,
                    height: 4,
                    backgroundColor: t.iconMuted,
                    borderRadius: 2,
                    alignSelf: 'center',
                    marginTop: -8,
                    marginBottom: 16,
                    opacity: 0.4,
                  }}
                />

                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'flex-start',
                    marginBottom: 16,
                  }}
                >
                  <View style={{ flex: 1 }}>
                    <View
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        marginBottom: 6,
                      }}
                    >
                      <View
                        style={{
                          backgroundColor: t.brandSubtle,
                          paddingHorizontal: 10,
                          paddingVertical: 4,
                          borderRadius: 999,
                        }}
                      >
                        <Text
                          style={{
                            color: t.brand,
                            fontSize: 9,
                            fontWeight: '900',
                            letterSpacing: 1.5,
                            textTransform: 'uppercase',
                          }}
                        >
                          {selected.categoria}
                        </Text>
                      </View>
                      {selectedDistanceKm != null && (
                        <View
                          style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            marginLeft: 8,
                          }}
                        >
                          <MapPin size={11} color={t.textMuted} />
                          <Text
                            style={{
                              marginLeft: 3,
                              fontSize: 11,
                              fontWeight: '800',
                              color: t.textMuted,
                            }}
                          >
                            {formatDistance(selectedDistanceKm)}
                          </Text>
                        </View>
                      )}
                    </View>
                    <Text
                      style={{
                        color: t.text,
                        fontWeight: '900',
                        fontSize: 22,
                        letterSpacing: -0.5,
                        marginBottom: 2,
                      }}
                      numberOfLines={1}
                    >
                      {selected.titulo}
                    </Text>
                    <Text
                      style={{ color: t.textMuted, fontSize: 12, fontWeight: '700' }}
                    >
                      {selected.estabelecimento}
                    </Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => setSelected(null)}
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 12,
                      backgroundColor: t.bgSubtle,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <X size={18} color={t.icon} />
                  </TouchableOpacity>
                </View>

                <View style={{ flexDirection: 'row', gap: 8, marginBottom: 16 }}>
                  <View
                    style={{
                      flex: 1,
                      backgroundColor: t.bgSubtle,
                      padding: 12,
                      borderRadius: 16,
                      alignItems: 'center',
                    }}
                  >
                    <Text
                      style={{
                        color: t.textMuted,
                        fontSize: 9,
                        fontWeight: '900',
                        letterSpacing: 1.2,
                        textTransform: 'uppercase',
                      }}
                    >
                      Disponível
                    </Text>
                    <Text
                      style={{
                        color: t.text,
                        fontSize: 14,
                        fontWeight: '900',
                        marginTop: 2,
                      }}
                    >
                      {selected.quantidade} un.
                    </Text>
                  </View>
                  {selected.validade && (
                    <View
                      style={{
                        flex: 1,
                        backgroundColor: t.bgSubtle,
                        padding: 12,
                        borderRadius: 16,
                        alignItems: 'center',
                      }}
                    >
                      <Text
                        style={{
                          color: t.textMuted,
                          fontSize: 9,
                          fontWeight: '900',
                          letterSpacing: 1.2,
                          textTransform: 'uppercase',
                        }}
                      >
                        Validade
                      </Text>
                      <Text
                        style={{
                          color: t.text,
                          fontSize: 14,
                          fontWeight: '900',
                          marginTop: 2,
                        }}
                      >
                        {selected.validade}
                      </Text>
                    </View>
                  )}
                </View>

                {selected.descricao ? (
                  <Text
                    style={{
                      color: t.textMuted,
                      fontSize: 13,
                      lineHeight: 19,
                      marginBottom: 16,
                    }}
                    numberOfLines={3}
                  >
                    {selected.descricao}
                  </Text>
                ) : null}

                <View style={{ gap: 10 }}>
                  <TouchableOpacity
                    onPress={handleOpenDirections}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'center',
                      height: 52,
                      borderRadius: 18,
                      borderWidth: 2,
                      borderColor: t.brand,
                    }}
                  >
                    <Compass size={18} color={t.brand} />
                    <Text
                      style={{
                        color: t.brand,
                        fontWeight: '900',
                        fontSize: 13,
                        marginLeft: 8,
                        letterSpacing: 1.5,
                        textTransform: 'uppercase',
                      }}
                    >
                      Como chegar
                    </Text>
                  </TouchableOpacity>

                  {selected.status === 'disponivel' &&
                    user?.tipo_perfil === 'Receptor' &&
                    selected.doadorId !== user?.id && (
                      <TouchableOpacity
                        disabled={isReserving}
                        onPress={handleReservar}
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          justifyContent: 'center',
                          height: 52,
                          borderRadius: 18,
                          backgroundColor: t.brand,
                          shadowColor: t.brand,
                          shadowOffset: { width: 0, height: 4 },
                          shadowOpacity: 0.3,
                          shadowRadius: 8,
                          elevation: 6,
                        }}
                      >
                        {isReserving ? (
                          <ActivityIndicator color="white" />
                        ) : (
                          <>
                            <CheckCircle2 size={18} color="white" />
                            <Text
                              style={{
                                color: 'white',
                                fontWeight: '900',
                                fontSize: 13,
                                marginLeft: 8,
                                letterSpacing: 1.5,
                                textTransform: 'uppercase',
                              }}
                            >
                              Reservar agora
                            </Text>
                          </>
                        )}
                      </TouchableOpacity>
                    )}

                  {selected.status !== 'disponivel' && (
                    <View
                      style={{
                        height: 52,
                        borderRadius: 18,
                        backgroundColor: t.bgSubtle,
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexDirection: 'row',
                      }}
                    >
                      <Info size={16} color={t.textMuted} />
                      <Text
                        style={{
                          marginLeft: 8,
                          color: t.textMuted,
                          fontWeight: '800',
                          fontSize: 12,
                          textTransform: 'uppercase',
                          letterSpacing: 1,
                        }}
                      >
                        {selected.status === 'reservado' ? 'Já reservada' : 'Entregue'}
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            )}
          </Animated.View>
        </View>
      )}
      <BottomTabBar activeTab="Mapa" />
    </SafeAreaView>
  );
};

export default MapScreen;
