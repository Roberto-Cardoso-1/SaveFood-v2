import React from 'react';
import { View, TouchableOpacity, Platform } from 'react-native';
import { Home, Map, User, PlusCircle, LucideIcon } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuthStore } from '../store/useAuthStore';
import { useTheme } from '../hooks/useTheme';

interface TabConfig {
  label: string;
  icon: LucideIcon;
  doadorOnly?: boolean;
}

const TABS: TabConfig[] = [
  { label: 'Início', icon: Home },
  { label: 'Doar', icon: PlusCircle, doadorOnly: true },
  { label: 'Mapa', icon: Map },
  { label: 'Perfil', icon: User },
];

interface TabItemProps {
  label: string;
  icon: LucideIcon;
  active: boolean;
  onPress: () => void;
}

const TabItem: React.FC<TabItemProps> = ({ icon: Icon, active, onPress }) => {
  const t = useTheme();
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      accessibilityRole="tab"
      className="items-center justify-center py-2 px-4"
    >
      <View
        className={`p-2 rounded-2xl ${
          active ? (t.isDark ? 'bg-green-500/20' : 'bg-green-50') : 'bg-transparent'
        }`}
      >
        <Icon
          size={22}
          color={active ? t.brand : t.isDark ? '#64748B' : '#9CA3AF'}
          strokeWidth={active ? 2.5 : 2}
        />
      </View>
      {active && <View className="w-1 h-1 bg-green-500 rounded-full mt-1" />}
    </TouchableOpacity>
  );
};

interface Props {
  activeTab?: string;
}

export const BottomTabBar: React.FC<Props> = ({ activeTab = 'Início' }) => {
  const navigation = useNavigation<any>();
  const user = useAuthStore((s) => s.user);
  const t = useTheme();
  const isDoador = user?.tipo_perfil === 'Doador';

  return (
    <View
      className={`absolute bottom-6 left-6 right-6 ${
        t.isDark ? 'bg-[#1E293B]/90' : 'bg-white/90'
      } flex-row justify-around items-center px-4 py-3 rounded-[32px] border ${
        t.isDark ? 'border-white/10' : 'border-gray-100'
      } shadow-xl ${t.isDark ? 'shadow-black' : 'shadow-gray-200'}`}
      style={
        Platform.OS === 'web'
          ? ({
              backdropFilter: 'blur(10px)',
              WebkitBackdropFilter: 'blur(10px)',
            } as any)
          : undefined
      }
    >
      {TABS.filter((tab) => !tab.doadorOnly || isDoador).map((tab) => (
        <TabItem
          key={tab.label}
          label={tab.label}
          icon={tab.icon}
          active={activeTab === tab.label}
          onPress={() => navigation.navigate(tab.label)}
        />
      ))}
    </View>
  );
};
