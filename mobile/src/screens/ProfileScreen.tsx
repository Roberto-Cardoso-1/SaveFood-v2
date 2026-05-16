import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, ActivityIndicator, Modal, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MapPin, ShoppingBag, Leaf, User, Clock, Settings, LogOut, ChevronRight, X, Shield, Bell, HelpCircle } from 'lucide-react-native';
import { BottomTabBar } from '../components/BottomTabBar';
import { useAppStore } from '../store/useAppStore';
import { styled } from 'nativewind';

const StyledSafeAreaView = styled(SafeAreaView);

const MenuItem: React.FC<{ icon: any; label: string; isLast?: boolean; danger?: boolean; onPress?: () => void; isDarkMode: boolean }> = ({ icon: Icon, label, isLast, danger, onPress, isDarkMode }) => (
  <TouchableOpacity 
    onPress={onPress}
    className={`flex-row items-center py-4 ${!isLast ? `border-b ${isDarkMode ? 'border-[#334155]' : 'border-gray-100'}` : ''}`}
  >
    <View className={`w-10 h-10 rounded-xl items-center justify-center ${danger ? 'bg-red-500/10' : isDarkMode ? 'bg-white/5' : 'bg-gray-50'}`}>
      <Icon size={20} color={danger ? '#EF4444' : isDarkMode ? '#94A3B8' : '#6B7280'} />
    </View>
    <Text className={`flex-1 ml-4 font-medium text-base ${danger ? 'text-red-500' : isDarkMode ? 'text-white' : 'text-gray-900'}`}>{label}</Text>
    <ChevronRight size={20} color={danger ? '#EF4444' : isDarkMode ? '#475569' : '#9CA3AF'} />
  </TouchableOpacity>
);

const ProfileScreen = () => {
  const { user, logout, isDarkMode } = useAppStore();
  const [activeModal, setActiveModal] = useState<string | null>(null);
  
  // Settings States
  const [pushEnabled, setPushEnabled] = useState(true);
  const [locationEnabled, setLocationEnabled] = useState(true);

  // Theme-aware styles
  const bgColor = isDarkMode ? 'bg-[#0F172A]' : 'bg-white';
  const textColor = isDarkMode ? 'text-white' : 'text-gray-900';
  const subTextColor = isDarkMode ? 'text-gray-400' : 'text-gray-500';
  const cardColor = isDarkMode ? 'bg-[#1E293B]' : 'bg-gray-50';
  const borderColor = isDarkMode ? 'border-[#334155]' : 'border-gray-100';

  const renderModalContent = () => {
    switch (activeModal) {
      case 'dados':
        return (
          <View className="px-6">
            <View className={`${cardColor} p-6 rounded-[32px] border ${borderColor} mb-6`}>
              <Text className={`${subTextColor} text-[10px] font-black uppercase tracking-widest mb-4`}>Informações da Conta</Text>
              <View className="space-y-4">
                <View>
                  <Text className={`${subTextColor} text-xs mb-1`}>Nome Completo</Text>
                  <Text className={`${textColor} font-bold text-base`}>{user?.name}</Text>
                </View>
                <View className={`h-[1px] ${isDarkMode ? 'bg-white/10' : 'bg-gray-200/50'} my-2`} />
                <View>
                  <Text className={`${subTextColor} text-xs mb-1`}>E-mail de Acesso</Text>
                  <Text className={`${textColor} font-bold text-base`}>{user?.email}</Text>
                </View>
                <View className={`h-[1px] ${isDarkMode ? 'bg-white/10' : 'bg-gray-200/50'} my-2`} />
                <View>
                  <Text className={`${subTextColor} text-xs mb-1`}>Tipo de Perfil</Text>
                  <Text className="text-green-600 font-bold text-base uppercase">{user?.tipo_perfil || 'Doador'}</Text>
                </View>
              </View>
            </View>
            <TouchableOpacity className="bg-green-500 py-4 rounded-2xl items-center shadow-lg shadow-green-500/20">
              <Text className="text-white font-black">EDITAR PERFIL</Text>
            </TouchableOpacity>
          </View>
        );
      case 'historico':
        return (
          <ScrollView className="px-6" showsVerticalScrollIndicator={false}>
            {[
              { id: 1, item: 'Cesta de Frutas', data: '14 Mai', local: 'Hortifruti', status: 'Finalizado' },
              { id: 2, item: 'Pães Artesanais', data: '12 Mai', local: 'Padaria Central', status: 'Finalizado' },
              { id: 3, item: 'Iogurte Natural', data: '10 Mai', local: 'Mini Mercado', status: 'Cancelado' },
            ].map((hist) => (
              <View key={hist.id} className={`${isDarkMode ? 'bg-[#1E293B]' : 'bg-white'} p-4 rounded-3xl border ${borderColor} mb-4 flex-row items-center`}>
                <View className={`w-12 h-12 rounded-2xl items-center justify-center mr-4 ${hist.status === 'Cancelado' ? 'bg-red-500/10' : 'bg-green-500/10'}`}>
                  <ShoppingBag size={20} color={hist.status === 'Cancelado' ? '#EF4444' : '#10B981'} />
                </View>
                <View className="flex-1">
                  <Text className={`${textColor} font-bold`}>{hist.item}</Text>
                  <Text className={`${subTextColor} text-xs`}>{hist.local} • {hist.data}</Text>
                </View>
                <View className={`px-3 py-1 rounded-full ${hist.status === 'Cancelado' ? 'bg-red-500/20' : 'bg-green-500/20'}`}>
                  <Text className={`text-[9px] font-black uppercase ${hist.status === 'Cancelado' ? 'text-red-600' : 'text-green-600'}`}>{hist.status}</Text>
                </View>
              </View>
            ))}
          </ScrollView>
        );
      case 'config':
        return (
          <View className="px-6">
            <View className={`${cardColor} p-6 rounded-[32px] border ${borderColor} mb-6`}>
              <View className="flex-row items-center justify-between mb-6">
                <View className="flex-row items-center">
                  <Bell size={20} color={isDarkMode ? '#94A3B8' : '#6B7280'} />
                  <Text className={`ml-3 ${textColor} font-bold`}>Notificações Push</Text>
                </View>
                <Switch value={pushEnabled} onValueChange={setPushEnabled} trackColor={{ true: '#10B981', false: '#334155' }} />
              </View>
              <View className="flex-row items-center justify-between mb-6">
                <View className="flex-row items-center">
                  <MapPin size={20} color={isDarkMode ? '#94A3B8' : '#6B7280'} />
                  <Text className={`ml-3 ${textColor} font-bold`}>Localização em Tempo Real</Text>
                </View>
                <Switch value={locationEnabled} onValueChange={setLocationEnabled} trackColor={{ true: '#10B981', false: '#334155' }} />
              </View>
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center">
                  <Shield size={20} color={isDarkMode ? '#94A3B8' : '#6B7280'} />
                  <Text className={`ml-3 ${textColor} font-bold`}>Privacidade de Dados</Text>
                </View>
                <ChevronRight size={20} color={isDarkMode ? '#475569' : '#D1D5DB'} />
              </View>
            </View>
            <View className={`${isDarkMode ? 'bg-blue-500/10 border-blue-500/20' : 'bg-blue-50 border-blue-100'} p-6 rounded-[32px] border flex-row items-center`}>
              <HelpCircle size={24} color="#3B82F6" />
              <View className="ml-4 flex-1">
                <Text className={`${isDarkMode ? 'text-blue-400' : 'text-blue-900'} font-bold`}>Central de Ajuda</Text>
                <Text className={`${isDarkMode ? 'text-blue-400/60' : 'text-blue-600'} text-xs`}>Precisa de suporte?</Text>
              </View>
            </View>
          </View>
        );
      default:
        return null;
    }
  };

  return (
    <StyledSafeAreaView className={`flex-1 ${bgColor}`}>
      {/* Detail Modal */}
      <Modal visible={!!activeModal} animationType="slide" transparent={true}>
        <View className="flex-1 bg-black/50 justify-end">
          <View className={`${isDarkMode ? 'bg-[#0F172A]' : 'bg-white'} rounded-t-[40px] h-[70%] pt-8`}>
            <View className="flex-row justify-between items-center px-6 mb-8">
              <Text className={`text-3xl font-black ${textColor} tracking-tighter uppercase`}>
                {activeModal === 'dados' ? 'Meus Dados' : activeModal === 'historico' ? 'Histórico' : 'Ajustes'}
              </Text>
              <TouchableOpacity onPress={() => setActiveModal(null)} className={`w-10 h-10 ${isDarkMode ? 'bg-white/10' : 'bg-gray-50'} rounded-full items-center justify-center`}>
                <X size={20} color={isDarkMode ? 'white' : '#111827'} />
              </TouchableOpacity>
            </View>
            {renderModalContent()}
          </View>
        </View>
      </Modal>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="items-center py-8 px-6">
          <View className="relative">
            <Image
              source={{ uri: user?.avatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400' }}
              className="w-32 h-32 rounded-full border-4 border-green-500/20"
            />
            <View className="absolute bottom-1 right-1 w-8 h-8 bg-green-500 rounded-full border-4 border-white items-center justify-center">
              <View className="w-2 h-2 bg-white rounded-full" />
            </View>
          </View>
          <Text className={`text-2xl font-black ${textColor} mt-4 tracking-tighter`}>{user?.name || 'Usuário'}</Text>
          <Text className={`${subTextColor} font-bold text-xs uppercase tracking-widest mt-1`}>{user?.email}</Text>
          
          <View className="bg-green-500/10 px-4 py-1.5 rounded-full mt-4 flex-row items-center border border-green-500/20">
            <Text className="text-green-600 font-black text-[10px] uppercase tracking-wider">
              Perfil {user?.tipo_perfil || 'Doador'}
            </Text>
          </View>
        </View>

        <View className="px-6 mb-8">
          <Text className={`text-[10px] font-black ${isDarkMode ? 'text-white/20' : 'text-gray-300'} mb-4 tracking-[3px] uppercase text-center`}>Meu Impacto Ambiental</Text>
          <View className="flex-row" style={{ gap: 16 }}>
            <View className={`${cardColor} p-6 rounded-[32px] border ${borderColor} items-center flex-1 shadow-sm`}>
              <ShoppingBag size={24} color="#10B981" />
              <Text className={`text-2xl font-black ${textColor} mt-2 tracking-tighter`}>15</Text>
              <Text className={`${subTextColor} text-[10px] font-black uppercase mt-1`}>Salvos</Text>
            </View>
            <View className={`${cardColor} p-6 rounded-[32px] border ${borderColor} items-center flex-1 shadow-sm`}>
              <Leaf size={24} color="#10B981" />
              <Text className={`text-2xl font-black ${textColor} mt-2 tracking-tighter`}>4kg</Text>
              <Text className={`${subTextColor} text-[10px] font-black uppercase mt-1`}>CO2</Text>
            </View>
          </View>
        </View>

        <View className="px-6 pb-24">
          <MenuItem icon={User} label="Meus Dados" isDarkMode={isDarkMode} onPress={() => setActiveModal('dados')} />
          <MenuItem icon={Clock} label="Histórico de Coletas" isDarkMode={isDarkMode} onPress={() => setActiveModal('historico')} />
          <MenuItem icon={Settings} label="Configurações" isDarkMode={isDarkMode} onPress={() => setActiveModal('config')} />
          <MenuItem 
            icon={LogOut} 
            label="Sair da Conta" 
            isDarkMode={isDarkMode}
            isLast 
            danger 
            onPress={logout}
          />
        </View>
      </ScrollView>
      <BottomTabBar activeTab="Perfil" />
    </StyledSafeAreaView>
  );
};

export default ProfileScreen;
