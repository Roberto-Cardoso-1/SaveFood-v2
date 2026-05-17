import React from 'react';
import { View, Text, TouchableOpacity, Platform } from 'react-native';
import { Home, Heart, Map, User, PlusCircle } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { useAppStore } from '../store/useAppStore';

interface TabItemProps {
  label: string;
  icon: any;
  active?: boolean;
  onPress: () => void;
  isDarkMode: boolean;
}

const TabItem: React.FC<TabItemProps> = ({ label, icon: Icon, active, onPress, isDarkMode }) => (
  <TouchableOpacity 
    onPress={onPress} 
    activeOpacity={0.7}
    className="items-center justify-center py-2 px-4"
  >
    <View className={`p-2 rounded-2xl ${active ? (isDarkMode ? 'bg-green-500/20' : 'bg-green-50') : 'bg-transparent'}`}>
      <Icon size={22} color={active ? '#10B981' : (isDarkMode ? '#64748B' : '#9CA3AF')} strokeWidth={active ? 2.5 : 2} />
    </View>
    {active && (
      <View className="w-1 h-1 bg-green-500 rounded-full mt-1" />
    )}
  </TouchableOpacity>
);

export const BottomTabBar = ({ activeTab = 'Início' }) => {
  const navigation = useNavigation<any>();
  const { isDarkMode } = useAppStore();

  const bgColor = isDarkMode ? 'bg-[#1E293B]/90' : 'bg-white/90';
  const borderColor = isDarkMode ? 'border-white/10' : 'border-gray-100';
  const shadowColor = isDarkMode ? 'shadow-black' : 'shadow-gray-200';

  return (
    <View 
      className={`absolute bottom-6 left-6 right-6 ${bgColor} flex-row justify-around items-center px-4 py-3 rounded-[32px] border ${borderColor} shadow-xl ${shadowColor}`}
      style={{
        ...Platform.select({
          web: {
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
          }
        })
      }}
    >
      <TabItem 
        label="Início" 
        icon={Home} 
        active={activeTab === 'Início'} 
        onPress={() => navigation.navigate('Início')}
        isDarkMode={isDarkMode}
      />
      <TabItem 
        label="Doar" 
        icon={PlusCircle} 
        active={activeTab === 'Doar'} 
        onPress={() => navigation.navigate('Doar')}
        isDarkMode={isDarkMode}
      />
      <TabItem 
        label="Mapa" 
        icon={Map} 
        active={activeTab === 'Mapa'} 
        onPress={() => navigation.navigate('Mapa')}
        isDarkMode={isDarkMode}
      />
      <TabItem 
        label="Perfil" 
        icon={User} 
        active={activeTab === 'Perfil'} 
        onPress={() => navigation.navigate('Perfil')}
        isDarkMode={isDarkMode}
      />
    </View>
  );
};
