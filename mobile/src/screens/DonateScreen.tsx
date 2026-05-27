import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image as RNImage,
  Alert,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Camera,
  ChevronDown,
  AlertCircle,
  Calendar as CalendarIcon,
  MapPin,
} from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import { BottomTabBar } from '../components/BottomTabBar';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { useDonationsStore } from '../store/useDonationsStore';
import { donationsService } from '../services/donations';
import { useTheme } from '../hooks/useTheme';
import { useUserLocation } from '../hooks/useUserLocation';

const CATEGORIES = ['Padaria', 'Frutas', 'Refeições', 'Doces', 'Laticínios', 'Outros'];

const DonateScreen = () => {
  const navigation = useNavigation<any>();
  const t = useTheme();
  const fetchDonations = useDonationsStore((s) => s.fetchDonations);
  // GPS opcional — se o usuário negar, a doação ainda é enviada sem coords.
  const { coords: gpsCoords, error: gpsError, refresh: gpsRefresh } = useUserLocation();

  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [quantidade, setQuantidade] = useState('');
  const [categoria, setCategoria] = useState('Padaria');
  const [validade, setValidade] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().slice(0, 10);
  });
  const [error, setError] = useState<string | null>(null);
  const [showCategories, setShowCategories] = useState(false);
  const [image, setImage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const bgColor = t.isDark ? 'bg-[#0F172A]' : 'bg-white';
  const textColor = t.isDark ? 'text-white' : 'text-gray-900';
  const subTextColor = t.isDark ? 'text-gray-400' : 'text-gray-500';
  const cardColor = t.isDark ? 'bg-[#1E293B]' : 'bg-gray-50';
  const borderColor = t.isDark ? 'border-[#334155]' : 'border-gray-100';
  const labelColor = t.isDark ? 'text-gray-300' : 'text-gray-800';

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permissão necessária', 'Precisamos de acesso às suas fotos.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });
    if (!result.canceled) setImage(result.assets[0].uri);
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permissão necessária', 'Precisamos de acesso à câmera.');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });
    if (!result.canceled) setImage(result.assets[0].uri);
  };

  const clearForm = () => {
    setTitulo('');
    setDescricao('');
    setQuantidade('');
    setCategoria('Padaria');
    setError(null);
    setImage(null);
  };

  const handleDonate = async () => {
    setError(null);
    const qty = parseInt(quantidade, 10);
    if (!titulo.trim() || !quantidade.trim()) {
      setError('Por favor, preencha o título e a quantidade.');
      return;
    }
    if (Number.isNaN(qty) || qty <= 0) {
      setError('A quantidade deve ser um número maior que zero.');
      return;
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(validade)) {
      setError('A validade deve estar no formato AAAA-MM-DD.');
      return;
    }

    setSubmitting(true);
    try {
      const created = await donationsService.create({
        produto: titulo.trim(),
        descricao: descricao.trim(),
        categoria,
        quantidade: qty,
        validade,
        imageUri: image,
        latitude: gpsCoords?.latitude,
        longitude: gpsCoords?.longitude,
      });
      await fetchDonations();

      const titleToPass = titulo;
      const qtyToPass = quantidade;
      clearForm();
      navigation.navigate('Confirmation', {
        title: titleToPass,
        quantity: qtyToPass,
        donationId: created.id,
      });
    } catch (err: any) {
      const data = err?.response?.data;
      const msg =
        (data?.quantidade && data.quantidade[0]) ||
        (data?.validade && data.validade[0]) ||
        (data?.detail) ||
        err?.message ||
        'Erro ao publicar a doação.';
      setError(typeof msg === 'string' ? msg : 'Erro ao publicar a doação.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView className={`flex-1 ${bgColor}`}>
      <View className="px-6 py-4 flex-row justify-between items-center">
        <Text className={`text-2xl font-black ${textColor} tracking-tighter`}>Nova Doação</Text>
        <TouchableOpacity onPress={clearForm}>
          <Text className="text-green-600 font-bold text-sm">Limpar</Text>
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false}>
        <TouchableOpacity
          onPress={pickImage}
          className={`w-full h-56 border-2 border-dashed ${borderColor} rounded-[32px] items-center justify-center ${cardColor} mb-8 mt-4 overflow-hidden`}
        >
          {image ? (
            <RNImage source={{ uri: image }} className="w-full h-full" />
          ) : (
            <>
              <View
                className={`w-16 h-16 ${
                  t.isDark ? 'bg-[#334155]' : 'bg-white'
                } rounded-2xl items-center justify-center shadow-sm mb-3`}
              >
                <Camera size={32} color="#10B981" />
              </View>
              <Text className={`${textColor} font-black text-base tracking-tight`}>
                Tirar foto do alimento
              </Text>
              <Text className={`${subTextColor} text-xs font-medium mt-1`}>
                Clique para selecionar da galeria
              </Text>
            </>
          )}
        </TouchableOpacity>

        {image && Platform.OS !== 'web' && (
          <TouchableOpacity
            onPress={takePhoto}
            className={`mb-8 self-center ${
              t.isDark ? 'bg-green-500/10' : 'bg-green-50'
            } px-6 py-2 rounded-full border border-green-500/20`}
          >
            <Text className="text-green-600 font-bold text-xs">TIRAR NOVA FOTO</Text>
          </TouchableOpacity>
        )}

        <View style={{ gap: 16 }}>
          <Input
            label="O que você está doando?"
            placeholder="Ex: Pão de Forma, Maçãs..."
            value={titulo}
            onChangeText={setTitulo}
          />

          <Input
            label="Descrição (opcional)"
            placeholder="Detalhes do alimento, condições de retirada..."
            value={descricao}
            onChangeText={setDescricao}
            multiline
          />

          <Input
            label="Quantidade"
            placeholder="Ex: 5"
            keyboardType="numeric"
            value={quantidade}
            onChangeText={setQuantidade}
          />

          <Input
            label="Validade (AAAA-MM-DD)"
            placeholder="2026-12-31"
            value={validade}
            onChangeText={setValidade}
            icon={CalendarIcon}
            autoCapitalize="none"
          />

          <View className="mb-6">
            <Text className={`${labelColor} mb-2 font-bold text-sm tracking-tight`}>Categoria</Text>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => setShowCategories(!showCategories)}
              className={`flex-row items-center ${cardColor} border-2 ${borderColor} rounded-2xl px-4 py-3.5`}
            >
              <Text className={`flex-1 ${textColor} font-medium`}>{categoria}</Text>
              <ChevronDown size={20} color={t.isDark ? '#64748B' : '#9CA3AF'} />
            </TouchableOpacity>

            {showCategories && (
              <View
                className={`mt-2 ${t.isDark ? 'bg-[#1E293B]' : 'bg-white'} border ${borderColor} rounded-2xl p-2 shadow-lg ${
                  t.isDark ? 'shadow-black' : 'shadow-gray-200'
                }`}
              >
                {CATEGORIES.map((cat) => (
                  <TouchableOpacity
                    key={cat}
                    onPress={() => {
                      setCategoria(cat);
                      setShowCategories(false);
                    }}
                    className="py-3 px-4 rounded-xl"
                  >
                    <Text
                      className={`font-bold ${
                        categoria === cat
                          ? 'text-green-600'
                          : t.isDark
                            ? 'text-gray-400'
                            : 'text-gray-600'
                      }`}
                    >
                      {cat}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          {error && (
            <View
              className={`flex-row items-center ${
                t.isDark ? 'bg-red-500/10 border-red-500/20' : 'bg-red-50 border-red-100'
              } p-4 rounded-2xl my-2 border`}
            >
              <AlertCircle size={20} color="#EF4444" />
              <Text className="text-red-600 ml-3 font-semibold text-sm flex-1">{error}</Text>
            </View>
          )}

          {/* 📍 Indicador de GPS — informa se a doação vai aparecer no mapa */}
          <TouchableOpacity
            onPress={gpsError ? gpsRefresh : undefined}
            activeOpacity={gpsError ? 0.7 : 1}
            className={`flex-row items-center p-4 rounded-2xl border ${
              gpsCoords
                ? t.isDark
                  ? 'bg-green-500/10 border-green-500/30'
                  : 'bg-green-50 border-green-200'
                : gpsError === 'denied'
                  ? t.isDark
                    ? 'bg-amber-500/10 border-amber-500/30'
                    : 'bg-amber-50 border-amber-200'
                  : t.isDark
                    ? 'bg-white/5 border-white/10'
                    : 'bg-gray-50 border-gray-100'
            }`}
          >
            <MapPin
              size={18}
              color={gpsCoords ? '#10B981' : gpsError === 'denied' ? '#D97706' : t.iconMuted}
            />
            <View className="flex-1 ml-3">
              <Text
                className={`font-black text-xs uppercase tracking-wider ${
                  gpsCoords
                    ? 'text-green-600'
                    : gpsError === 'denied'
                      ? 'text-amber-600'
                      : subTextColor
                }`}
              >
                {gpsCoords
                  ? 'Localização capturada'
                  : gpsError === 'denied'
                    ? 'Localização negada'
                    : 'Detectando localização...'}
              </Text>
              <Text className={`${subTextColor} text-[11px] mt-0.5`}>
                {gpsCoords
                  ? 'Sua doação aparecerá no mapa para quem está perto.'
                  : gpsError === 'denied'
                    ? 'Toque para tentar de novo. Sem GPS, a doação não aparece no mapa.'
                    : 'Aguarde um instante...'}
              </Text>
            </View>
          </TouchableOpacity>

          <View className={`shadow-2xl ${t.isDark ? 'shadow-black' : 'shadow-green-200'}`}>
            <Button title="Publicar Doação" loading={submitting} onPress={handleDonate} />
          </View>
          <View className="h-24" />
        </View>
      </ScrollView>
      <BottomTabBar activeTab="Doar" />
    </SafeAreaView>
  );
};

export default DonateScreen;
