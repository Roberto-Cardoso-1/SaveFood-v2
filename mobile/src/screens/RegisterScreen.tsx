import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  Image,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ArrowLeft,
  User,
  Mail,
  Lock,
  Box,
  ShoppingBag,
  AlertCircle,
  Camera,
  Trophy,
} from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { Toast } from '../components/Toast';
import { authService } from '../services/auth';
import { useTheme } from '../hooks/useTheme';

const RegisterScreen = () => {
  const navigation = useNavigation<any>();
  const t = useTheme();
  const [objective, setObjective] = useState<'doador' | 'receptor' | null>(null);
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [avatar, setAvatar] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  const [showToast, setShowToast] = useState(false);

  const bgColor = t.isDark ? 'bg-[#0F172A]' : 'bg-white';
  const textColor = t.isDark ? 'text-white' : 'text-gray-900';
  const subTextColor = t.isDark ? 'text-gray-400' : 'text-gray-500';
  const borderColor = t.isDark ? 'border-[#334155]' : 'border-green-50';

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
    if (!result.canceled) setAvatar(result.assets[0].uri);
  };

  const handleRegister = async () => {
    setError(null);
    if (!nome || !email || !senha || !objective) {
      setError('Por favor, preencha todos os campos e selecione seu perfil.');
      return;
    }
    if (senha.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres.');
      return;
    }

    setLoading(true);
    try {
      const user = await authService.register({
        nome: nome.trim(),
        email: email.trim().toLowerCase(),
        senha,
        tipo_perfil: objective,
      });

      // Se o usuário escolheu um avatar local, sobe agora.
      if (avatar) {
        try {
          await authService.updateProfile({
            userId: user.id,
            avatarUri: avatar,
            isNewAvatar: true,
          });
        } catch {
          // não bloqueia o cadastro se o avatar falhar
        }
      }

      setShowToast(true);
      setTimeout(() => setShowWelcomeModal(true), 1800);
    } catch (err: any) {
      const data = err?.response?.data;
      const msg =
        (data?.email && data.email[0]) ||
        (data?.senha && data.senha[0]) ||
        (data?.tipo_perfil && data.tipo_perfil[0]) ||
        'Erro ao cadastrar. Tente novamente.';
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
    <SafeAreaView className={`flex-1 ${bgColor}`}>
      <Toast
        visible={showToast}
        message="Cadastro realizado com sucesso!"
        onHide={() => setShowToast(false)}
      />

      <Modal visible={showWelcomeModal} animationType="fade" transparent>
        <View className="flex-1 bg-black/60 items-center justify-center px-6">
          <View
            className={`${
              t.isDark ? 'bg-[#1E293B]' : 'bg-white'
            } w-full rounded-[48px] p-8 items-center border ${borderColor} shadow-2xl`}
          >
            {avatar ? (
              <Image
                source={{ uri: avatar }}
                className="w-24 h-24 rounded-[32px] rotate-12 mb-8"
              />
            ) : (
              <View className="w-24 h-24 bg-green-500 rounded-[32px] items-center justify-center shadow-xl shadow-green-500/20 rotate-12 mb-8">
                <Text className="text-white text-3xl font-black -rotate-12">
                  {getInitials(nome)}
                </Text>
              </View>
            )}

            <Text
              className={`text-3xl font-black ${textColor} text-center tracking-tighter leading-tight`}
            >
              Bem-vindo ao SaveFood, {nome.split(' ')[0]}! 🍎
            </Text>

            <Text className={`${subTextColor} text-center text-base mt-4 px-2 leading-6`}>
              Que alegria ter você conosco! Sua jornada para combater o desperdício de alimentos
              começa agora.
            </Text>

            <View
              className={`w-full ${
                t.isDark ? 'bg-white/5' : 'bg-green-50'
              } rounded-3xl p-6 my-8 flex-row items-center`}
            >
              <View className="w-12 h-12 bg-green-500 rounded-2xl items-center justify-center mr-4">
                <Trophy size={24} color="white" />
              </View>
              <View className="flex-1">
                <Text className={`${textColor} font-black text-sm uppercase tracking-wider`}>
                  Primeiro Passo
                </Text>
                <Text className={`${subTextColor} text-xs`}>
                  Você acaba de ganhar 100 pontos de boas-vindas!
                </Text>
              </View>
            </View>

            <TouchableOpacity
              onPress={() => setShowWelcomeModal(false)}
              className="w-full bg-green-500 py-5 rounded-[24px] items-center shadow-lg shadow-green-500/30"
            >
              <Text className="text-white font-black text-lg uppercase tracking-widest">
                VAMOS COMEÇAR
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <ScrollView showsVerticalScrollIndicator={false} className="px-6">
        <View className="py-8">
          <View className="flex-row justify-between items-center mb-10">
            <TouchableOpacity
              className={`w-12 h-12 ${
                t.isDark ? 'bg-white/5 border-white/10' : 'bg-white border-gray-100'
              } rounded-2xl items-center justify-center border shadow-sm`}
              onPress={() => navigation.goBack()}
            >
              <ArrowLeft size={20} color={t.isDark ? 'white' : '#111827'} />
            </TouchableOpacity>
            <View
              className={`h-1.5 w-12 ${
                t.isDark ? 'bg-green-500/20' : 'bg-green-100'
              } rounded-full`}
            />
          </View>

          <Text className={`text-5xl font-black ${textColor} tracking-tighter mb-2 leading-tight`}>
            Criar Conta
          </Text>
          <Text className={`${subTextColor} text-lg font-medium mb-8`}>
            Crie sua conta para ajudar a economizar{' '}
            <Text className="text-green-600 font-bold">comida</Text>.
          </Text>

          <View className="items-center mb-10">
            <TouchableOpacity
              onPress={pickAvatar}
              className={`w-32 h-32 ${
                t.isDark ? 'bg-white/5' : 'bg-gray-50'
              } rounded-full border-4 ${borderColor} items-center justify-center overflow-hidden`}
            >
              {avatar ? (
                <Image source={{ uri: avatar }} className="w-full h-full" />
              ) : (
                <View className="items-center">
                  <Camera size={32} color={t.isDark ? '#475569' : '#D1D5DB'} />
                  <Text
                    className={`text-[10px] font-black ${
                      t.isDark ? 'text-gray-600' : 'text-gray-400'
                    } mt-1 uppercase tracking-tighter`}
                  >
                    Foto
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          </View>

          <View style={{ gap: 20 }}>
            <Input
              label="Nome"
              placeholder="Seu nome completo"
              icon={User}
              value={nome}
              onChangeText={(text) => {
                setNome(text);
                setError(null);
              }}
            />
            <Input
              label="E-mail"
              placeholder="seu@email.com"
              icon={Mail}
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                setError(null);
              }}
            />
            <Input
              label="Senha"
              placeholder="Escolha uma senha (mín. 6)"
              icon={Lock}
              secureTextEntry
              value={senha}
              onChangeText={(text) => {
                setSenha(text);
                setError(null);
              }}
            />

            <View className="mt-4 mb-4">
              <Text className={`text-xl font-black ${textColor} mb-6 tracking-tight`}>
                O que você quer fazer?
              </Text>
              <View className="flex-row" style={{ gap: 16 }}>
                <TouchableOpacity
                  onPress={() => {
                    setObjective('doador');
                    setError(null);
                  }}
                  className={`flex-1 p-4 rounded-[32px] border-2 ${
                    objective === 'doador'
                      ? 'border-green-500 bg-green-500/10'
                      : t.isDark
                        ? 'border-white/10 bg-white/5'
                        : 'border-gray-200 bg-gray-50'
                  } items-center justify-center`}
                >
                  <View
                    className={`w-14 h-14 rounded-2xl items-center justify-center mb-3 ${
                      objective === 'doador'
                        ? 'bg-green-500'
                        : t.isDark
                          ? 'bg-white/10'
                          : 'bg-gray-200'
                    }`}
                  >
                    <Box
                      size={28}
                      color={
                        objective === 'doador' ? 'white' : t.isDark ? '#94A3B8' : '#64748B'
                      }
                    />
                  </View>
                  <Text
                    className={`font-bold text-xs uppercase tracking-widest ${
                      objective === 'doador'
                        ? 'text-green-600'
                        : t.isDark
                          ? 'text-gray-300'
                          : 'text-gray-600'
                    }`}
                  >
                    Vou Doar
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => {
                    setObjective('receptor');
                    setError(null);
                  }}
                  className={`flex-1 p-4 rounded-[32px] border-2 ${
                    objective === 'receptor'
                      ? 'border-green-500 bg-green-500/10'
                      : t.isDark
                        ? 'border-white/10 bg-white/5'
                        : 'border-gray-200 bg-gray-50'
                  } items-center justify-center`}
                >
                  <View
                    className={`w-14 h-14 rounded-2xl items-center justify-center mb-3 ${
                      objective === 'receptor'
                        ? 'bg-green-500'
                        : t.isDark
                          ? 'bg-white/10'
                          : 'bg-gray-200'
                    }`}
                  >
                    <ShoppingBag
                      size={28}
                      color={
                        objective === 'receptor' ? 'white' : t.isDark ? '#94A3B8' : '#64748B'
                      }
                    />
                  </View>
                  <Text
                    className={`font-bold text-xs uppercase tracking-widest ${
                      objective === 'receptor'
                        ? 'text-green-600'
                        : t.isDark
                          ? 'text-gray-300'
                          : 'text-gray-600'
                    }`}
                  >
                    Vou Receber
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {error && (
              <View
                className={`flex-row items-center ${
                  t.isDark ? 'bg-red-500/10 border-red-500/20' : 'bg-red-50 border-red-100'
                } p-5 rounded-[24px] border`}
              >
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
    </SafeAreaView>
  );
};

export default RegisterScreen;
