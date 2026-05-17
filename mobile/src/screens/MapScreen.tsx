import React from 'react';
import { View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BottomTabBar } from '../components/BottomTabBar';
import { useAppStore } from '../store/useAppStore';
import { styled } from 'nativewind';

const StyledSafeAreaView = styled(SafeAreaView);

const MapScreen = () => {
  const isDarkMode = useAppStore((state) => state.isDarkMode);

  return (
    <StyledSafeAreaView className={`flex-1 ${isDarkMode ? 'bg-[#0F172A]' : 'bg-white'} items-center justify-center`}>
      <Text className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Mapa de Alimentos</Text>
      <Text className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'} mt-2`}>Funcionalidade em desenvolvimento</Text>
      <BottomTabBar activeTab="Mapa" />
    </StyledSafeAreaView>
  );
};

export default MapScreen;
