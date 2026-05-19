import React, { useState, useEffect, useRef, useMemo } from 'react';
import { View, Text, TouchableOpacity, Dimensions, Animated, TextInput, Alert, PanResponder, StyleSheet, Easing } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MapPin, Search, Navigation, Star, Clock, ChevronRight, X, Heart, Store, Leaf, ShoppingBag, Zap, Compass, Info } from 'lucide-react-native';
import { BottomTabBar } from '../components/BottomTabBar';
import { useAppStore } from '../store/useAppStore';
import { styled } from 'nativewind';
import { useNavigation } from '@react-navigation/native';
import api from '../services/api';

const StyledSafeAreaView = styled(SafeAreaView);
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const MAP_SIZE = 1500;
const MAX_X = 0;
const MIN_X = -(MAP_SIZE - SCREEN_WIDTH);
const MAX_Y = 0;
const MIN_Y = -(MAP_SIZE - SCREEN_HEIGHT);

const MapScreen = () => {
  const navigation = useNavigation<any>();
  const { isDarkMode, donations, localizacao } = useAppStore();
  
  const [selectedPlace, setSelectedPlace] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [favorites, setFavorites] = useState<number[]>([]);
  const [isReserving, setIsReserving] = useState(false);

  const pan = useRef(new Animated.ValueXY({ x: -(MAP_SIZE/2 - SCREEN_WIDTH/2), y: -(MAP_SIZE/2 - SCREEN_HEIGHT/2) })).current;
  const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const radarAnim1 = useRef(new Animated.Value(0)).current;
  const radarAnim2 = useRef(new Animated.Value(0)).current;
  const markerPulseAnim = useRef(new Animated.Value(1)).current;

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (_, gesture) => Math.abs(gesture.dx) > 5 || Math.abs(gesture.dy) > 5,
      onPanResponderGrant: () => {
        pan.setOffset({ x: (pan.x as any)._value, y: (pan.y as any)._value });
        pan.setValue({ x: 0, y: 0 });
      },
      onPanResponderMove: (e, gesture) => {
        let newX = (pan.x as any)._offset + gesture.dx;
        let newY = (pan.y as any)._offset + gesture.dy;
        if (newX > MAX_X) gesture.dx = MAX_X - (pan.x as any)._offset;
        if (newX < MIN_X) gesture.dx = MIN_X - (pan.x as any)._offset;
        if (newY > MAX_Y) gesture.dy = MAX_Y - (pan.y as any)._offset;
        if (newY < MIN_Y) gesture.dy = MIN_Y - (pan.y as any)._offset;
        Animated.event([null, { dx: pan.x, dy: pan.y }], { useNativeDriver: false })(e, gesture);
      },
      onPanResponderRelease: () => {
        pan.flattenOffset();
      },
    })
  ).current;

  useEffect(() => {
    const createRadarLoop = (anim: Animated.Value, delay: number) => {
      return Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.parallel([
            Animated.timing(anim, { toValue: 1, duration: 2000, easing: Easing.out(Easing.quad), useNativeDriver: true }),
            Animated.timing(anim, { toValue: 0, duration: 0, useNativeDriver: true }),
          ])
        ])
      );
    };
    createRadarLoop(radarAnim1, 0).start();
    createRadarLoop(radarAnim2, 1000).start();
    Animated.loop(
      Animated.sequence([
        Animated.timing(markerPulseAnim, { toValue: 1.2, duration: 800, useNativeDriver: true }),
        Animated.timing(markerPulseAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const centerOnMarker = (marker: any) => {
    const targetX = -(marker.mapX - SCREEN_WIDTH/2 + 28);
    const targetY = -(marker.mapY - SCREEN_HEIGHT/2 + 120);
    Animated.spring(pan, {
      toValue: { x: Math.max(MIN_X, Math.min(MAX_X, targetX)), y: Math.max(MIN_Y, Math.min(MAX_Y, targetY)) },
      useNativeDriver: false,
      tension: 50,
      friction: 12
    }).start();
  };

  const mapMarkers = useMemo(() => {
    const center = MAP_SIZE / 2;
    return donations.map((d, index) => {
      const seed = d.id || index;
      const angle = (seed * 137.5) * (Math.PI / 180);
      const radius = 150 + (index % 5) * 80;
      return {
        ...d,
        mapX: center + radius * Math.cos(angle) - 40,
        mapY: center + radius * Math.sin(angle) - 40,
        rating: (4.5 + (index % 5) / 10).toFixed(1),
        status: index % 3 === 0 ? 'Popular' : 'Aberto'
      };
    });
  }, [donations]);

  const filteredMarkers = mapMarkers.filter(m => {
    const term = searchQuery.toLowerCase();
    return (m.estabelecimento?.toLowerCase() || '').includes(term) || (m.produto?.toLowerCase() || '').includes(term);
  });

  useEffect(() => {
    if (selectedPlace) {
      Animated.spring(slideAnim, { toValue: 0, useNativeDriver: true, tension: 60, friction: 10 }).start();
    } else {
      Animated.timing(slideAnim, { toValue: SCREEN_HEIGHT, duration: 250, useNativeDriver: true }).start();
    }
  }, [selectedPlace]);

  const mapBg = isDarkMode ? 'bg-[#0F172A]' : 'bg-[#F8FAFC]';
  const cardBg = isDarkMode ? 'bg-[#1E293B]/95' : 'bg-white/95';
  const roadColor = isDarkMode ? 'bg-white/5' : 'bg-black/[0.03]';

  return (
    <StyledSafeAreaView className={`flex-1 ${mapBg}`}>
      <View className="flex-1 relative overflow-hidden">
        <Animated.View {...panResponder.panHandlers} style={[{ width: MAP_SIZE, height: MAP_SIZE }, { transform: pan.getTranslateTransform() }]}>
          <View className={`absolute inset-0 ${isDarkMode ? 'bg-[#0F172A]' : 'bg-[#F1F5F9]'}`}>
            {[...Array(15)].map((_, i) => <View key={`v-${i}`} className={`absolute h-full w-[2px] ${roadColor}`} style={{ left: i * 100 }} />)}
            {[...Array(15)].map((_, i) => <View key={`h-${i}`} className={`absolute w-full h-[2px] ${roadColor}`} style={{ top: i * 100 }} />)}
          </View>
          <View className="absolute" style={{ left: MAP_SIZE/2 - 50, top: MAP_SIZE/2 - 50 }}>
            <Animated.View style={{ transform: [{ scale: radarAnim1 }], opacity: radarAnim1.interpolate({ inputRange: [0, 1], outputRange: [0.6, 0] }) }} className="absolute w-[100px] h-[100px] rounded-full bg-blue-500/30 border border-blue-500/50" />
            <Animated.View style={{ transform: [{ scale: radarAnim2 }], opacity: radarAnim2.interpolate({ inputRange: [0, 1], outputRange: [0.6, 0] }) }} className="absolute w-[100px] h-[100px] rounded-full bg-blue-500/30 border border-blue-500/50" />
            <View className="absolute left-[30px] top-[30px] w-10 h-10 bg-blue-600 rounded-full border-4 border-white items-center justify-center shadow-2xl">
              <Navigation size={18} color="white" />
            </View>
          </View>
          {filteredMarkers.map((place) => {
            const isSelected = selectedPlace?.id === place.id;
            return (
              <TouchableOpacity key={place.id} onPress={() => { setSelectedPlace(place); centerOnMarker(place); }} activeOpacity={0.7} style={{ position: 'absolute', left: place.mapX, top: place.mapY, zIndex: isSelected ? 100 : 50, padding: 10 }}>
                <View className="items-center">
                  {isSelected && <Animated.View style={{ transform: [{ scale: markerPulseAnim }] }} className="absolute w-20 h-20 bg-green-500/20 rounded-full -top-3" />}
                  <View className={`w-14 h-14 rounded-[22px] items-center justify-center shadow-2xl border-2 ${isSelected ? 'bg-green-500 border-white' : isDarkMode ? 'bg-[#1E293B] border-white/10' : 'bg-white border-gray-100'}`}>
                    <Store size={24} color={isSelected ? 'white' : '#10B981'} />
                  </View>
                  <View className={`mt-2 px-3 py-1 rounded-full ${isDarkMode ? 'bg-black/60' : 'bg-white/90 shadow-md'}`}>
                    <Text className={`${isDarkMode ? 'text-white' : 'text-gray-900'} text-[9px] font-black uppercase`}>{(place.estabelecimento || 'Loja').split(' ')[0]}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            );
          })}
        </Animated.View>
        <View className="absolute top-6 left-6 right-6 z-50">
          <View className={`flex-row items-center ${cardBg} rounded-3xl px-5 py-4 shadow-2xl border ${isDarkMode ? 'border-white/5' : 'border-gray-100'}`}>
            <Search size={20} color="#10B981" />
            <TextInput className={`${isDarkMode ? 'text-white' : 'text-gray-900'} font-bold flex-1 ml-4`} placeholder="Buscar no mapa..." placeholderTextColor="#94A3B8" value={searchQuery} onChangeText={setSearchQuery} />
          </View>
        </View>
        <TouchableOpacity className="absolute bottom-36 right-6 w-14 h-14 bg-green-500 rounded-3xl items-center justify-center shadow-2xl z-50" onPress={() => { Animated.spring(pan, { toValue: { x: -(MAP_SIZE/2 - SCREEN_WIDTH/2), y: -(MAP_SIZE/2 - SCREEN_HEIGHT/2) }, useNativeDriver: false }).start(); setSelectedPlace(null); }}>
          <Navigation size={24} color="white" />
        </TouchableOpacity>
        <Animated.View style={{ transform: [{ translateY: slideAnim }] }} className="absolute bottom-24 left-4 right-4 z-[100]">
          {selectedPlace && (
            <View className={`${cardBg} rounded-[48px] p-8 shadow-2xl border ${isDarkMode ? 'border-white/10' : 'border-gray-100'}`}>
              <View className="w-12 h-1.5 bg-gray-300/30 rounded-full self-center -mt-2 mb-6" />
              <View className="flex-row justify-between items-start mb-6">
                <View className="flex-1">
                  <View className="flex-row items-center mb-1">
                    <View className="bg-green-500/20 px-3 py-1 rounded-full"><Text className="text-green-500 font-black text-[9px] uppercase tracking-widest">{selectedPlace.status}</Text></View>
                    <View className="flex-row items-center ml-4"><Star size={12} color="#FBBF24" fill="#FBBF24" /><Text className={`ml-1 font-black text-xs ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{selectedPlace.rating}</Text></View>
                  </View>
                  <Text className={`text-3xl font-black ${isDarkMode ? 'text-white' : 'text-gray-900'} tracking-tighter`}>{selectedPlace.estabelecimento || 'Mercado'}</Text>
                  <Text className="text-gray-500 text-xs font-bold">{selectedPlace.produto}</Text>
                </View>
                <TouchableOpacity onPress={() => setSelectedPlace(null)} className={`w-12 h-12 ${isDarkMode ? 'bg-white/5' : 'bg-gray-100'} rounded-2xl items-center justify-center`}><X size={24} color={isDarkMode ? 'white' : '#1E293B'} /></TouchableOpacity>
              </View>
              <View className="flex-row mb-8" style={{ gap: 12 }}>
                <View className={`flex-1 ${isDarkMode ? 'bg-white/5' : 'bg-gray-50'} p-4 rounded-3xl items-center justify-center`}>
                  <Text className="text-gray-400 font-black text-[8px] uppercase tracking-widest">Disponível</Text>
                  <Text className={`text-sm font-black ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{selectedPlace.quantidade} unidades</Text>
                </View>
              </View>
              <View className="flex-row" style={{ gap: 16 }}>
                <TouchableOpacity 
                  onPress={() => {
                    const nomeProduto = selectedPlace.produto || "Alimento Variado";
                    const desc = selectedPlace.descricao || "Este estabelecimento disponibilizou este item para evitar o desperdício. O alimento está em perfeitas condições para consumo imediato.";
                    const dataValidade = selectedPlace.validade || "Hoje até as 22h";
                    
                    Alert.alert(
                      selectedPlace.estabelecimento || "Estabelecimento Parceiro",
                      `📦 Item: ${nomeProduto}\n\n📝 Detalhes: ${desc}\n\n🕒 Retirada: ${dataValidade}\n\n📍 Local: ${localizacao}`,
                      [{ text: "FECHAR", style: "cancel" }]
                    );
                  }}
                  className="flex-1 bg-green-500 h-20 rounded-[30px] items-center justify-center flex-row shadow-lg"
                >
                  <Text className="text-white font-black text-lg uppercase tracking-widest mr-2">VER DETALHES</Text>
                  <Info size={20} color="white" />
                </TouchableOpacity>
              </View>
            </View>
          )}
        </Animated.View>
      </View>
      <BottomTabBar activeTab="Mapa" />
    </StyledSafeAreaView>
  );
};

export default MapScreen;
