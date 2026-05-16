import React from 'react';
import { View, Text, TouchableOpacity, Platform } from 'react-native';
import { Home, Heart, Map, User, PlusCircle } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';

interface TabItemProps {
  label: string;
  icon: any;
  active?: boolean;
  onPress: () => void;
}

const TabItem: React.FC<TabItemProps> = ({ label, icon: Icon, active, onPress }) => (
  <TouchableOpacity 
    onPress={onPress} 
    activeOpacity={0.7}
    className="items-center justify-center py-2 px-4"
  >
    <View className={`p-2 rounded-2xl ${active ? 'bg-green-50' : 'bg-transparent'}`}>
      <Icon size={22} color={active ? '#10B981' : '#9CA3AF'} strokeWidth={active ? 2.5 : 2} />
    </View>
    {active && (
      <View className="w-1 h-1 bg-green-500 rounded-full mt-1" />
    )}
  </TouchableOpacity>
);

export const BottomTabBar = ({ activeTab = 'Início' }) => {
  const navigation = useNavigation<any>();

  return (
    <View 
      className="absolute bottom-6 left-6 right-6 bg-white/90 flex-row justify-around items-center px-4 py-3 rounded-[32px] border border-gray-100 shadow-xl shadow-gray-200"
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
      />
      <TabItem 
        label="Doar" 
        icon={PlusCircle} 
        active={activeTab === 'Doar'} 
        onPress={() => navigation.navigate('Doar')}
      />
      <TabItem 
        label="Mapa" 
        icon={Map} 
        active={activeTab === 'Mapa'} 
        onPress={() => navigation.navigate('Mapa')}
      />
      <TabItem 
        label="Perfil" 
        icon={User} 
        active={activeTab === 'Perfil'} 
        onPress={() => navigation.navigate('Perfil')}
      />
    </View>
  );
};
