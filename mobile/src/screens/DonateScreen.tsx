import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image as RNImage, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Camera, Calendar, ChevronDown, AlertCircle } from 'lucide-react-native';
import { BottomTabBar } from '../components/BottomTabBar';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { useAppStore } from '../store/useAppStore';
import { useNavigation } from '@react-navigation/native';
import { styled } from 'nativewind';
import * as ImagePicker from 'expo-image-picker';

const StyledSafeAreaView = styled(SafeAreaView);

const CATEGORIES = ['Padaria', 'Frutas', 'Refeições', 'Doces', 'Laticínios'];

const DonateScreen = () => {
  const navigation = useNavigation<any>();
  const addDonation = useAppStore((state) => state.addDonation);
  const [titulo, setTitulo] = useState('');
  const [quantidade, setQuantidade] = useState('');
  const [categoria, setCategoria] = useState('Padaria');
  const [error, setError] = useState<string | null>(null);
  const [showCategories, setShowCategories] = useState(false);
  const [image, setImage] = useState<string | null>(null);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert('Permissão necessária', 'Precisamos de acesso às suas fotos para enviar a doação.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert('Permissão necessária', 'Precisamos de acesso à sua câmera para tirar a foto.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const handleDonate = () => {
    setError(null);
    if (!titulo || !quantidade) {
      setError('Por favor, preencha o título e a quantidade.');
      return;
    }

    addDonation({
      titulo,
      quantidade,
      categoria,
      imagem: image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800',
    });

    const titleToPass = titulo;
    const qtyToPass = quantidade;

    setTitulo('');
    setQuantidade('');
    setCategoria('Padaria');
    setImage(null);

    navigation.navigate('Confirmation', { title: titleToPass, quantity: qtyToPass });
  };

  return (
    <StyledSafeAreaView className="flex-1 bg-white">
      <View className="px-6 py-4 flex-row justify-between items-center">
        <Text className="text-2xl font-black text-gray-900 tracking-tighter">Nova Doação</Text>
        <TouchableOpacity onPress={() => { setTitulo(''); setQuantidade(''); setError(null); setImage(null); }}>
          <Text className="text-green-600 font-bold text-sm">Limpar</Text>
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false}>
        <TouchableOpacity 
          onPress={pickImage}
          className="w-full h-56 border-2 border-dashed border-gray-100 rounded-[32px] items-center justify-center bg-gray-50 mb-8 mt-4 overflow-hidden"
        >
          {image ? (
            <RNImage source={{ uri: image }} className="w-full h-full" />
          ) : (
            <>
              <View className="w-16 h-16 bg-white rounded-2xl items-center justify-center shadow-sm mb-3">
                <Camera size={32} color="#10B981" />
              </View>
              <Text className="text-gray-900 font-black text-base tracking-tight">Tirar foto do alimento</Text>
              <Text className="text-gray-400 text-xs font-medium mt-1">Clique para selecionar da galeria</Text>
            </>
          )}
        </TouchableOpacity>

        {image && (
          <TouchableOpacity 
            onPress={takePhoto}
            className="mb-8 self-center bg-green-50 px-6 py-2 rounded-full border border-green-100"
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
            label="Quantidade"
            placeholder="Ex: 5"
            keyboardType="numeric"
            value={quantidade}
            onChangeText={setQuantidade}
          />

          <View className="mb-6">
            <Text className="text-gray-800 mb-2 font-bold text-sm tracking-tight">Categoria</Text>
            <TouchableOpacity 
              activeOpacity={0.7}
              onPress={() => setShowCategories(!showCategories)}
              className="flex-row items-center bg-gray-50 border-2 border-gray-100 rounded-2xl px-4 py-3.5"
            >
              <Text className="flex-1 text-gray-900 font-medium">{categoria}</Text>
              <ChevronDown size={20} color="#9CA3AF" />
            </TouchableOpacity>
            
            {showCategories && (
              <View className="mt-2 bg-white border border-gray-100 rounded-2xl p-2 shadow-lg shadow-gray-200">
                {CATEGORIES.map((cat) => (
                  <TouchableOpacity 
                    key={cat}
                    onPress={() => {
                      setCategoria(cat);
                      setShowCategories(false);
                    }}
                    className="py-3 px-4 rounded-xl active:bg-green-50"
                  >
                    <Text className={`font-bold ${categoria === cat ? 'text-green-600' : 'text-gray-600'}`}>{cat}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          {error && (
            <View className="flex-row items-center bg-red-50 p-4 rounded-2xl my-2 border border-red-100">
              <AlertCircle size={20} color="#EF4444" />
              <Text className="text-red-600 ml-3 font-semibold text-sm flex-1">{error}</Text>
            </View>
          )}

          <View className="shadow-2xl shadow-green-200">
            <Button 
              title="Publicar Doação" 
              onPress={handleDonate} 
            />
          </View>
          <View className="h-24" />
        </View>
      </ScrollView>
      <BottomTabBar activeTab="Doar" />
    </StyledSafeAreaView>
  );
};

export default DonateScreen;
