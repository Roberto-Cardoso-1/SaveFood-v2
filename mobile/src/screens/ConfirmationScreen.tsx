import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Check, Leaf, Share2 } from 'lucide-react-native';
import { Button } from '../components/Button';
import { useNavigation, useRoute } from '@react-navigation/native';
import { styled } from 'nativewind';

const StyledSafeAreaView = styled(SafeAreaView);

const ConfirmationScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { title, quantity } = route.params || { title: 'Item', quantity: '1' };

  return (
    <StyledSafeAreaView className="flex-1 bg-white">
      <View className="flex-1 px-6 justify-center items-center">
        <View className="w-24 h-24 bg-green-500 rounded-full items-center justify-center mb-6">
          <Check size={48} color="white" strokeWidth={3} />
        </View>

        <Text className="text-3xl font-bold text-gray-900 text-center mb-2">
          Doação Confirmada!
        </Text>
        <Text className="text-gray-500 text-center text-base mb-10 px-4">
          O seu item já está disponível para ser salvo por alguém próximo.
        </Text>

        <View className="w-full bg-gray-50 rounded-3xl p-4 flex-row items-center border border-gray-100 mb-6">
          <Image
            source={{ uri: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400' }}
            className="w-20 h-20 rounded-2xl"
          />
          <View className="ml-4 flex-1">
            <Text className="text-gray-900 font-bold text-lg">{title}</Text>
            <Text className="text-gray-500 text-sm">Quantidade: {quantity} unidades</Text>
            <Text className="text-green-500 text-sm font-medium mt-1">Expira em breve</Text>
          </View>
        </View>

        <View className="flex-row items-center bg-green-50 px-4 py-2 rounded-full mb-12">
          <Leaf size={16} color="#10B981" fill="#10B981" />
          <Text className="text-green-600 font-bold text-xs ml-2">
            ACABOU DE EVITAR 0.5KG DE CO2
          </Text>
        </View>

        <View className="w-full" style={{ gap: 16 }}>
          <Button title="Ver Minhas Doações" onPress={() => navigation.navigate('Início')} />
          <TouchableOpacity
            className="w-full py-4 rounded-xl flex-row items-center justify-center border border-gray-200"
          >            <Share2 size={20} color="#6B7280" />
            <Text className="text-gray-500 font-bold ml-2">Partilhar Impacto</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity className="mt-8" onPress={() => navigation.navigate('Início')}>
          <Text className="text-gray-400 font-medium">Voltar para o início</Text>
        </TouchableOpacity>
      </View>
    </StyledSafeAreaView>
  );
};

export default ConfirmationScreen;
