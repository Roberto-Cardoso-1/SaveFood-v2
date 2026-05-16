import React from 'react';
import { View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BottomTabBar } from '../components/BottomTabBar';
import { styled } from 'nativewind';

const StyledSafeAreaView = styled(SafeAreaView);

const MapScreen = () => {
  return (
    <StyledSafeAreaView className="flex-1 bg-white items-center justify-center">
      <Text className="text-xl font-bold text-gray-900">Mapa de Alimentos</Text>
      <Text className="text-gray-500 mt-2">Funcionalidade em desenvolvimento</Text>
      <BottomTabBar activeTab="Mapa" />
    </StyledSafeAreaView>
  );
};

export default MapScreen;
