import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, ActivityIndicator, Modal, Switch, Alert, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MapPin, ShoppingBag, Leaf, User, Clock, Settings, LogOut, ChevronRight, X, Shield, Bell, HelpCircle, Camera, Trash2 } from 'lucide-react-native';
import { BottomTabBar } from '../components/BottomTabBar';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { useAppStore } from '../store/useAppStore';
import { styled } from 'nativewind';
import * as ImagePicker from 'expo-image-picker';
import api from '../services/api';

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
  const { user, logout, isDarkMode, updateUser } = useAppStore();
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Form States
  const [tempName, setTempName] = useState(user?.name || '');
  const [tempAvatar, setTempAvatar] = useState(user?.avatar || null);

  // Settings States
  const [pushEnabled, setPushEnabled] = useState(true);
  const [locationEnabled, setLocationEnabled] = useState(true);

  useEffect(() => {
    if (activeModal === 'dados') {
      setTempName(user?.name || '');
      setTempAvatar(user?.avatar || null);
      setIsEditing(false);
    }
  }, [activeModal, user]);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permissão necessária', 'Precisamos de acesso às suas fotos.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (!result.canceled) {
      setTempAvatar(result.assets[0].uri);
    }
  };

  const handleSaveProfile = async () => {
    if (!tempName) {
      Alert.alert('Erro', 'O nome não pode estar vazio.');
      return;
    }

    if (!user?.id) {
      Alert.alert('Sessão expirada', 'Faça login novamente.');
      return;
    }

    setLoading(true);
    try {
      const isNewLocalImage = tempAvatar && !tempAvatar.startsWith('http');
      let response;

      if (isNewLocalImage) {
        const formData = new FormData();
        formData.append('nome', tempName);
        
        const uriParts = tempAvatar!.split('.');
        const fileType = uriParts[uriParts.length - 1];
        const fileName = tempAvatar!.split('/').pop();
        
        formData.append('avatar', {
          uri: Platform.OS === 'ios' ? tempAvatar!.replace('file://', '') : tempAvatar,
          name: fileName || `avatar.${fileType}`,
          type: `image/${fileType === 'jpg' ? 'jpeg' : fileType}`,
        } as any);

        response = await api.patch(`usuarios/${user.id}/`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      } else {
        const payload: any = { nome: tempName };
        if (tempAvatar === null) payload.avatar = null;

        response = await api.patch(`usuarios/${user.id}/`, payload);
      }

      if (response.status === 200 || response.status === 204 || response.status === 201) {
        const updatedUser = response.data;
        let avatarUrl = updatedUser.avatar;
        if (avatarUrl && !avatarUrl.startsWith('http')) {
          avatarUrl = `http://127.0.0.1:8000${avatarUrl}`;
        }

        updateUser({ name: updatedUser.nome, avatar: avatarUrl || undefined });
        setIsEditing(false);
        Alert.alert('Sucesso', 'Perfil atualizado!');
      }
    } catch (err: any) {
      console.error('Erro ao salvar:', err.response?.data || err.message);
      Alert.alert('Erro', 'Não foi possível salvar as alterações.');
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (name: string) => {
    if (!name) return '??';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return parts[0][0].toUpperCase();
  };

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
          <View className="px-6 flex-1">
            <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
              {isEditing ? (
                <View className="space-y-6">
                  {/* Edit Avatar */}
                  <View className="items-center mb-8">
                    <View className="relative">
                      {tempAvatar ? (
                        <Image source={{ uri: tempAvatar }} className="w-32 h-32 rounded-full border-4 border-green-500/20" />
                      ) : (
                        <View className="w-32 h-32 rounded-full bg-green-500 items-center justify-center border-4 border-green-500/20">
                          <Text className="text-white text-4xl font-black">{getInitials(tempName)}</Text>
                        </View>
                      )}
                      <TouchableOpacity 
                        onPress={pickImage}
                        className="absolute bottom-0 right-0 w-10 h-10 bg-green-500 rounded-full border-4 border-white items-center justify-center shadow-lg"
                      >
                        <Camera size={18} color="white" />
                      </TouchableOpacity>
                      {tempAvatar && (
                        <TouchableOpacity 
                          onPress={() => setTempAvatar(null)}
                          className="absolute top-0 right-0 w-8 h-8 bg-red-500 rounded-full border-2 border-white items-center justify-center shadow-lg"
                        >
                          <Trash2 size={14} color="white" />
                        </TouchableOpacity>
                      )}
                    </View>
                    <Text className={`${subTextColor} text-[10px] font-black uppercase mt-4 tracking-widest text-center`}>Toque para alterar a foto</Text>
                  </View>

                  <Input
                    label="Nome Completo"
                    value={tempName}
                    onChangeText={setTempName}
                    placeholder="Seu nome"
                  />

                  <View className="mt-8">
                    <Button title="SALVAR ALTERAÇÕES" loading={loading} onPress={handleSaveProfile} />
                    <TouchableOpacity 
                      onPress={() => setIsEditing(false)}
                      className="w-full py-4 items-center"
                    >
                      <Text className={`${subTextColor} font-bold`}>Cancelar</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ) : (
                <>
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
                  <TouchableOpacity 
                    onPress={() => setIsEditing(true)}
                    className="bg-green-500 py-4 rounded-2xl items-center shadow-lg shadow-green-500/20"
                  >
                    <Text className="text-white font-black">EDITAR PERFIL</Text>
                  </TouchableOpacity>
                </>
              )}
            </ScrollView>
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
      <Modal visible={!!activeModal} animationType="slide" transparent={true}>
        <View className="flex-1 bg-black/50 justify-end">
          <View className={`${isDarkMode ? 'bg-[#0F172A]' : 'bg-white'} rounded-t-[40px] h-[85%] pt-8`}>
            <View className="flex-row justify-between items-center px-6 mb-8">
              <Text className={`text-3xl font-black ${textColor} tracking-tighter uppercase`}>
                {activeModal === 'dados' ? (isEditing ? 'Editar Perfil' : 'Meus Dados') : activeModal === 'historico' ? 'Histórico' : 'Ajustes'}
              </Text>
              <TouchableOpacity onPress={() => { setActiveModal(null); setIsEditing(false); }} className={`w-10 h-10 ${isDarkMode ? 'bg-white/10' : 'bg-gray-50'} rounded-full items-center justify-center`}>
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
            {user?.avatar ? (
              <Image
                source={{ uri: user.avatar }}
                className="w-32 h-32 rounded-full border-4 border-green-500/20"
              />
            ) : (
              <View className="w-32 h-32 rounded-full bg-green-500 items-center justify-center border-4 border-green-500/20">
                <Text className="text-white text-4xl font-black">{getInitials(user?.name || '')}</Text>
              </View>
            )}
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
