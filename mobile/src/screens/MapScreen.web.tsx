import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Compass, MapPin, Smartphone, ShoppingBag } from 'lucide-react-native';
import { BottomTabBar } from '../components/BottomTabBar';
import { useDonationsStore } from '../store/useDonationsStore';
import { useTheme } from '../hooks/useTheme';

const MapScreenWeb = () => {
  const t = useTheme();
  const { donations } = useDonationsStore();

  const geolocated = donations.filter((d) => d.latitude != null && d.longitude != null);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: t.bg }} edges={['top']}>
      <ScrollView
        contentContainerStyle={{ padding: 24, paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ alignItems: 'center', marginBottom: 32, marginTop: 16 }}>
          <View
            style={{
              width: 80,
              height: 80,
              borderRadius: 24,
              backgroundColor: t.brandSubtle,
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 20,
            }}
          >
            <Compass size={40} color={t.brand} />
          </View>
          <Text
            style={{
              color: t.text,
              fontWeight: '900',
              fontSize: 24,
              letterSpacing: -0.5,
              textAlign: 'center',
            }}
          >
            Mapa interativo no app
          </Text>
          <Text
            style={{
              color: t.textMuted,
              marginTop: 8,
              textAlign: 'center',
              lineHeight: 22,
              maxWidth: 320,
              fontSize: 14,
            }}
          >
            Abra o SaveFood no celular (Expo Go ou APK) para ver o mapa em tempo real com sua
            localização. Aqui na web mostramos as doações disponíveis em formato de lista.
          </Text>
        </View>

        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: 16,
            paddingHorizontal: 4,
          }}
        >
          <MapPin size={18} color={t.brand} />
          <Text
            style={{
              marginLeft: 8,
              color: t.text,
              fontSize: 11,
              fontWeight: '900',
              letterSpacing: 2,
              textTransform: 'uppercase',
            }}
          >
            {geolocated.length} doações com localização
          </Text>
        </View>

        {geolocated.length === 0 ? (
          <View
            style={{
              padding: 32,
              backgroundColor: t.bgSubtle,
              borderRadius: 24,
              borderWidth: 1,
              borderColor: t.border,
              alignItems: 'center',
            }}
          >
            <Smartphone size={32} color={t.iconMuted} />
            <Text
              style={{
                color: t.textMuted,
                marginTop: 12,
                fontSize: 13,
                fontWeight: '700',
                textAlign: 'center',
              }}
            >
              Nenhuma doação tem coordenadas ainda.
            </Text>
          </View>
        ) : (
          geolocated.map((d) => (
            <View
              key={d.id}
              style={{
                flexDirection: 'row',
                backgroundColor: t.card,
                padding: 16,
                borderRadius: 20,
                borderWidth: 1,
                borderColor: t.border,
                marginBottom: 12,
                alignItems: 'center',
              }}
            >
              <View
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 16,
                  backgroundColor: t.brand,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <ShoppingBag size={20} color="white" />
              </View>
              <View style={{ flex: 1, marginLeft: 14 }}>
                <Text style={{ color: t.text, fontWeight: '900', fontSize: 15 }} numberOfLines={1}>
                  {d.titulo}
                </Text>
                <Text
                  style={{ color: t.textMuted, fontSize: 11, fontWeight: '700', marginTop: 2 }}
                  numberOfLines={1}
                >
                  {d.estabelecimento} • {d.categoria}
                </Text>
                <Text style={{ color: t.brand, fontSize: 10, fontWeight: '800', marginTop: 4 }}>
                  📍 {d.latitude?.toFixed(4)}, {d.longitude?.toFixed(4)}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => {
                  if (typeof window !== 'undefined') {
                    window.open(
                      `https://www.google.com/maps/search/?api=1&query=${d.latitude},${d.longitude}`,
                      '_blank',
                    );
                  }
                }}
                style={{
                  paddingHorizontal: 12,
                  paddingVertical: 8,
                  borderRadius: 12,
                  backgroundColor: t.brandSubtle,
                }}
              >
                <Text
                  style={{
                    color: t.brand,
                    fontSize: 10,
                    fontWeight: '900',
                    textTransform: 'uppercase',
                  }}
                >
                  Abrir
                </Text>
              </TouchableOpacity>
            </View>
          ))
        )}
      </ScrollView>
      <BottomTabBar activeTab="Mapa" />
    </SafeAreaView>
  );
};

export default MapScreenWeb;
