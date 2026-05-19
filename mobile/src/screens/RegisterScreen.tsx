import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert, Image, Modal, Animated, Easing } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, User, Mail, Lock, Box, ShoppingBag, AlertCircle, Camera, Sparkles, Trophy, CheckCircle2 } from 'lucide-react-native';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { useAppStore } from '../store/useAppStore';
import { styled } from 'nativewind';
import * as ImagePicker from 'expo-image-picker';
import { useNavigation } from '@react-navigation/native';
import api from '../services/api';

const StyledSafeAreaView = styled(SafeAreaView);

const RegisterScreen = () => {
  const navigation = useNavigation<any>();
  const { setUser, isDarkMode } = useAppStore();
  const [objective, setObjective] = useState<'doador' | 'receptor' | null>(null);
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [avatar, setAvatar] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);

  // Custom Toast State
  const [showToast, setShowToast] = useState(false);
  const toastOpacity = useRef(new Animated.Value(0)).current;
  const toastY = useRef(new Animated.Value(-20)).current;

  // Theme-aware styles
  const bgColor = isDarkMode ? 'bg-[#0F172A]' : 'bg-white';
  const textColor = isDarkMode ? 'text-white' : 'text-gray-900';
  const subTextColor = isDarkMode ? 'text-gray-400' : 'text-gray-500';
  const borderColor = isDarkMode ? 'border-[#334155]' : 'border-green-50';

  const triggerToast = () => {
    setShowToast(true);
    Animated.parallel([
      Animated.timing(toastOpacity, { toValue: 1, duration: 300, useNativeDriver: true }),
      Animated.timing(toastY, { toValue: 0, duration: 300, useNativeDriver: true }),
    ]).start();

    setTimeout(() => {
      Animated.parallel([
        Animated.timing(toastOpacity, { toValue: 0, duration: 300, useNativeDriver: true }),
        Animated.timing(toastY, { toValue: -20, duration: 300, useNativeDriver: true }),
      ]).start(() => setShowToast(false));
    }, 1500);
  };

  const pickAvatar = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert('Permissão necessária', 'Precisamos de permissão para acessar sua galeria.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });

    if (!result.canceled) {
      setAvatar(result.assets[0].uri);
    }
  };

  const handleRegister = async () => {
    setError(null);
    
    if (!nome || !email || !senha || !objective) {
      setError('Por favor, preencha todos os campos e selecione seu perfil.');
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('usuarios/', {
        nome,
        email,
        senha,
        tipo_perfil: objective,
      });

      if (response.status === 201) {
        triggerToast();

        // Aguarda o toast antes de mostrar o modal de boas-vindas
        setTimeout(() => {
          setUser({
            id: response.data.id,
            name: nome,
            email: email,
            avatar: avatar || undefined,
            tipo_perfil: objective === 'doador' ? 'Doador' : 'Receptor',
          });
          setShowWelcomeModal(true);
        }, 1800);
      }
    } catch (err: any) {
      console.error('Erro ao registrar:', err.response?.data || err.message);
      const msg = err.response?.data?.email ? 'Este e-mail já existe.' : 'Erro ao cadastrar. Tente novamente.';
      setError(msg);
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

  return (
    <StyledSafeAreaView className={`flex-1 ${bgColor}`}>
      {/* 🍞 Custom Success Toast */}
      {showToast && (
        <Animated.View 
          style={{ 
            opacity: toastOpacity, 
            transform: [{ translateY: toastY }],
            position: 'absolute',
            top: 60,
            left: 24,
            right: 24,
            zIndex: 100
          }}
        >
          <View className={`flex-row items-center ${isDarkMode ? 'bg-[#1E293B]' : 'bg-green-600'} px-6 py-4 rounded-3xl shadow-2xl border ${isDarkMode ? 'border-green-500/30' : 'border-green-500'}`}>
            <CheckCircle2 size={24} color="#10B981" />
            <Text className="text-white font-black ml-4 text-base tracking-tight">Cadastro realizado com sucesso!</Text>
          </View>
        </Animated.View>
      )}

      {/* 🌟 Welcome Modal */}
      <Modal visible={showWelcomeModal} animationType="fade" transparent={true}>
        <View className="flex-1 bg-black/60 items-center justify-center px-6">
          <View className={`${isDarkMode ? 'bg-[#1E293B]' : 'bg-white'} w-full rounded-[48px] p-8 items-center border ${borderColor} shadow-2xl`}>
            {avatar ? (
              <Image source={{ uri: avatar }} className="w-24 h-24 rounded-[32px] rotate-12 mb-8" />
            ) : (
              <View className="w-24 h-24 bg-green-500 rounded-[32px] items-center justify-center shadow-xl shadow-green-500/20 rotate-12 mb-8">
                <Text className="text-white text-3xl font-black -rotate-12">{getInitials(nome)}</Text>
              </View>
            )}
            
            <Text className={`text-3xl font-black ${textColor} text-center tracking-tighter leading-tight`}>
              Bem-vindo ao SaveFood, {nome.split(' ')[0]}! 🍎
            </Text>
            
            <Text className={`${subTextColor} text-center text-base mt-4 px-2 leading-6`}>
              Que alegria ter você conosco! Sua jornada para combater o desperdício de alimentos começa agora.
            </Text>

            <View className={`w-full ${isDarkMode ? 'bg-white/5' : 'bg-green-50'} rounded-3xl p-6 my-8 flex-row items-center`}>
              <View className="w-12 h-12 bg-green-500 rounded-2xl items-center justify-center mr-4">
                <Trophy size={24} color="white" />
              </View>
              <View className="flex-1">
                <Text className={`${textColor} font-black text-sm uppercase tracking-wider`}>Primeiro Passo</Text>
                <Text className={`${subTextColor} text-xs`}>Você acaba de ganhar 100 pontos de boas-vindas!</Text>
              </View>
            </View>

            <TouchableOpacity 
              onPress={() => setShowWelcomeModal(false)}
              className="w-full bg-green-500 py-5 rounded-[24px] items-center shadow-lg shadow-green-500/30"
            >
              <Text className="text-white font-black text-lg uppercase tracking-widest">VAMOS COMEÇAR</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <ScrollView showsVerticalScrollIndicator={false} className="px-6">
        <View className="py-8">
          <View className="flex-row justify-between items-center mb-10">
            <TouchableOpacity 
              className={`w-12 h-12 ${isDarkMode ? 'bg-white/5 border-white/10' : 'bg-white border-gray-100'} rounded-2xl items-center justify-center border shadow-sm`} 
              onPress={() => navigation.goBack()}
            >
              <ArrowLeft size={20} color={isDarkMode ? 'white' : '#111827'} />
            </TouchableOpacity>
            <View className={`h-1.5 w-12 ${isDarkMode ? 'bg-green-500/20' : 'bg-green-100'} rounded-full`} />
          </View>
          
          <Text className={`text-5xl font-black ${textColor} tracking-tighter mb-2 leading-tight`}>Criar Conta</Text>
          <Text className={`${subTextColor} text-lg font-medium mb-8`}>
            Crie sua conta para ajudar a economizar <Text className="text-green-600 font-bold">comida</Text>.
          </Text>

          <View className="items-center mb-10">
            <TouchableOpacity 
              onPress={pickAvatar}
              className={`w-32 h-32 ${isDarkMode ? 'bg-white/5' : 'bg-gray-50'} rounded-full border-4 ${borderColor} items-center justify-center overflow-hidden`}
            >
              {avatar ? (
                <Image source={{ uri: avatar }} className="w-full h-full" />
              ) : (
                <View className="items-center">
                  <Camera size={32} color={isDarkMode ? '#475569' : '#D1D5DB'} />
                  <Text className={`text-[10px] font-black ${isDarkMode ? 'text-gray-600' : 'text-gray-400'} mt-1 uppercase tracking-tighter`}>Foto</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>

          <View style={{ gap: 20 }}>
            <Input label="Nome" placeholder="Seu nome completo" icon={User} value={nome} onChangeText={(text) => { setNome(text); setError(null); }} />
            <Input label="E-mail" placeholder="seu@email.com" icon={Mail} keyboardType="email-address" autoCapitalize="none" value={email} onChangeText={(text) => { setEmail(text); setError(null); }} />
            <Input label="Senha" placeholder="Escolha uma senha" icon={Lock} secureTextEntry value={senha} onChangeText={(text) => { setSenha(text); setError(null); }} />

            <View className="mt-4 mb-4">
              <Text className={`text-xl font-black ${textColor} mb-6 tracking-tight`}>O que você quer fazer?</Text>
              <View className="flex-row" style={{ gap: 16 }}>
                <TouchableOpacity
                  onPress={() => { setObjective('doador'); setError(null); }}
                  className={`flex-1 p-4 rounded-[32px] border-2 ${objective === 'doador' ? 'border-green-500 bg-green-500/10' : isDarkMode ? 'border-white/10 bg-white/5' : 'border-gray-200 bg-gray-50'} items-center justify-center`}
                >
                  <View className={`w-14 h-14 rounded-2xl items-center justify-center mb-3 ${objective === 'doador' ? 'bg-green-500' : isDarkMode ? 'bg-white/10' : 'bg-gray-200'}`}>
                    <Box size={28} color={objective === 'doador' ? 'white' : isDarkMode ? '#94A3B8' : '#64748B'} />
                  </View>
                  <Text className={`font-bold text-xs uppercase tracking-widest ${objective === 'doador' ? 'text-green-600' : isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Vou Doar</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => { setObjective('receptor'); setError(null); }}
                  className={`flex-1 p-4 rounded-[32px] border-2 ${objective === 'receptor' ? 'border-green-500 bg-green-500/10' : isDarkMode ? 'border-white/10 bg-white/5' : 'border-gray-200 bg-gray-50'} items-center justify-center`}
                >
                  <View className={`w-14 h-14 rounded-2xl items-center justify-center mb-3 ${objective === 'receptor' ? 'bg-green-500' : isDarkMode ? 'bg-white/10' : 'bg-gray-200'}`}>
                    <ShoppingBag size={28} color={objective === 'receptor' ? 'white' : isDarkMode ? '#94A3B8' : '#64748B'} />
                  </View>
                  <Text className={`font-bold text-xs uppercase tracking-widest ${objective === 'receptor' ? 'text-green-600' : isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Vou Receber</Text>
                </TouchableOpacity>
              </View>
            </View>

            {error && (
              <View className={`flex-row items-center ${isDarkMode ? 'bg-red-500/10 border-red-500/20' : 'bg-red-50 border-red-100'} p-5 rounded-[24px] border`}>
                <View className="w-10 h-10 bg-red-100/20 rounded-full items-center justify-center mr-4">
                  <AlertCircle size={20} color="#EF4444" />
                </View>
                <Text className="text-red-500 font-bold text-sm flex-1 leading-tight">{error}</Text>
              </View>
            )}

            <View className="mt-4 mb-10 shadow-2xl shadow-green-500/10">
              <Button title="Criar conta" loading={loading} onPress={handleRegister} />
            </View>
          </View>

          <View className="flex-row justify-center pb-12">
            <Text className={`${subTextColor} font-medium text-base`}>Já tem uma conta? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text className="text-green-600 font-black text-base">Entrar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </StyledSafeAreaView>
  );
};

export default RegisterScreen;
