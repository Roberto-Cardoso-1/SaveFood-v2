import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Mail,
  Lock,
  Leaf,
  AlertCircle,
  Moon,
  Sun,
  Sparkles,
} from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { Toast } from '../components/Toast';
import { useUiStore } from '../store/useUiStore';
import { useAuthStore } from '../store/useAuthStore';
import { authService } from '../services/auth';
import { useTheme } from '../hooks/useTheme';

const LoginScreen = () => {
  const navigation = useNavigation<any>();
  const t = useTheme();
  const toggleDarkMode = useUiStore((s) => s.toggleDarkMode);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingGoogle, setLoadingGoogle] = useState(false);
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  const [userName, setUserName] = useState('');
  const [showToast, setShowToast] = useState(false);

  const handleLogin = async () => {
    setError(null);
    if (!email || !password) {
      setError('Por favor, preencha todos os campos para entrar.');
      return;
    }

    setLoading(true);
    try {
      const user = await authService.login(email.trim().toLowerCase(), password);
      setUserName(user.name);
      setShowToast(true);
      setTimeout(() => setShowWelcomeModal(true), 1800);
    } catch (err: any) {
      const status = err?.response?.status;
      setError(
        status === 401 || status === 400
          ? 'E-mail ou senha incorretos.'
          : status === 404
            ? 'Usuário não encontrado.'
            : 'Ocorreu um erro ao tentar entrar. Tente novamente.',
      );
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    // Mock — login social ainda não está integrado no backend
    setLoadingGoogle(true);
    setTimeout(() => {
      useAuthStore.getState().setUser({
        id: 0,
        name: 'Usuário Google',
        email: 'google@teste.com',
        avatar: undefined,
        tipo_perfil: 'Receptor',
      });
      setLoadingGoogle(false);
    }, 1200);
  };

  const bgColor = t.isDark ? 'bg-[#0F172A]' : 'bg-white';
  const textColor = t.isDark ? 'text-white' : 'text-gray-900';
  const subTextColor = t.isDark ? 'text-gray-400' : 'text-gray-500';

  return (
    <SafeAreaView className={`flex-1 ${bgColor}`}>
      <Toast
        visible={showToast}
        message="Login efetuado com sucesso!"
        onHide={() => setShowToast(false)}
      />

      <Modal visible={showWelcomeModal} animationType="fade" transparent>
        <View className="flex-1 bg-black/60 items-center justify-center px-6">
          <View
            className={`${
              t.isDark ? 'bg-[#1E293B]' : 'bg-white'
            } w-full rounded-[48px] p-8 items-center border ${
              t.isDark ? 'border-white/10' : 'border-green-50'
            } shadow-2xl`}
          >
            <View className="w-24 h-24 bg-green-500 rounded-[32px] items-center justify-center shadow-xl shadow-green-500/20 rotate-12 mb-8">
              <View className="-rotate-12">
                <Sparkles size={48} color="white" fill="white" />
              </View>
            </View>

            <Text className={`text-3xl font-black ${textColor} text-center tracking-tighter leading-tight`}>
              Que bom ver você de volta, {userName.split(' ')[0]}! 🍎
            </Text>

            <Text className={`${subTextColor} text-center text-base mt-4 px-2 leading-6`}>
              Estamos felizes em tê-lo novamente na nossa missão de salvar alimentos.
            </Text>

            <TouchableOpacity
              onPress={() => setShowWelcomeModal(false)}
              className="w-full bg-green-500 py-5 rounded-[24px] items-center shadow-lg shadow-green-500/30 mt-10"
            >
              <Text className="text-white font-black text-lg uppercase tracking-widest">
                VAMOS LÁ
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <View className="absolute top-12 right-6 z-50">
        <TouchableOpacity
          onPress={toggleDarkMode}
          className={`w-12 h-12 ${
            t.isDark ? 'bg-white/10' : 'bg-gray-100'
          } rounded-2xl items-center justify-center border ${
            t.isDark ? 'border-white/10' : 'border-gray-200'
          }`}
        >
          {t.isDark ? <Sun size={20} color="#FBBF24" /> : <Moon size={20} color="#475569" />}
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        className="px-6"
        showsVerticalScrollIndicator={false}
      >
        <View className="flex-1 justify-center py-12">
          <View className="items-center mb-10">
            <View className="relative">
              <View
                className={`absolute -inset-4 ${
                  t.isDark ? 'bg-green-500/10' : 'bg-green-100/50'
                } rounded-[40px] rotate-6`}
              />
              <View className="w-24 h-24 bg-green-500 rounded-[32px] items-center justify-center shadow-xl shadow-green-500/20 rotate-12">
                <View className="-rotate-12">
                  <Leaf size={48} color="white" fill="white" />
                </View>
              </View>
            </View>
            <Text className={`text-5xl font-black ${textColor} tracking-tighter mt-10`}>
              SaveFood
            </Text>
            <View className="h-1.5 w-12 bg-green-500 rounded-full mt-2 mb-4" />
            <Text className={`${subTextColor} text-center text-lg font-medium px-8 leading-6`}>
              Economize comida e ajude o <Text className="text-green-600 font-bold">planeta</Text>.
            </Text>
          </View>

          <View className={`w-full ${t.isDark ? 'bg-transparent' : 'bg-white'} rounded-[40px] p-2`}>
            <View style={{ gap: 16 }}>
              <Input
                placeholder="Seu e-mail"
                label="E-mail"
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
                placeholder="Sua senha"
                label="Senha"
                icon={Lock}
                secureTextEntry
                value={password}
                onChangeText={(text) => {
                  setPassword(text);
                  setError(null);
                }}
              />
            </View>

            <TouchableOpacity
              className="self-end mt-1 mb-8"
              onPress={() => navigation.navigate('ForgotPassword')}
            >
              <Text className="text-green-600 font-bold text-sm tracking-tight">
                Esqueci minha senha
              </Text>
            </TouchableOpacity>

            {error && (
              <View
                className={`flex-row items-center ${
                  t.isDark ? 'bg-red-500/10' : 'bg-red-50'
                } p-5 rounded-[24px] mb-8 border ${
                  t.isDark ? 'border-[#334155]' : 'border-red-100/50'
                }`}
              >
                <View className="w-10 h-10 bg-red-100/20 rounded-full items-center justify-center mr-4">
                  <AlertCircle size={20} color="#EF4444" />
                </View>
                <Text className="text-red-500 font-bold text-sm flex-1 leading-tight">
                  {error}
                </Text>
              </View>
            )}

            <View className="shadow-2xl shadow-green-500/10">
              <Button title="Entrar" loading={loading} onPress={handleLogin} />
            </View>

            <View className="flex-row items-center my-10">
              <View className={`flex-1 h-[1.5px] ${t.isDark ? 'bg-white/5' : 'bg-gray-50'}`} />
              <Text className="mx-6 text-gray-400 font-black text-[10px] uppercase tracking-[3px]">
                ou entrar com
              </Text>
              <View className={`flex-1 h-[1.5px] ${t.isDark ? 'bg-white/5' : 'bg-gray-50'}`} />
            </View>

            <View className="items-center">
              <TouchableOpacity
                disabled={loadingGoogle}
                onPress={handleGoogleLogin}
                activeOpacity={0.8}
                style={{ width: 220 }}
                className={`h-14 ${
                  t.isDark ? 'bg-white/5' : 'bg-white'
                } rounded-2xl items-center justify-center border-2 ${
                  t.isDark ? 'border-white/10' : 'border-gray-50'
                } shadow-lg flex-row`}
              >
                {loadingGoogle ? (
                  <ActivityIndicator color="#10B981" />
                ) : (
                  <>
                    <View className="w-5 h-5 bg-white border border-gray-200 rounded-full items-center justify-center mr-3">
                      <Text className="text-[10px] font-black text-blue-500">G</Text>
                    </View>
                    <Text className={`font-bold ${t.isDark ? 'text-white' : 'text-gray-800'}`}>
                      Login com Google
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            </View>

            <View className="flex-row justify-center mt-12 mb-4">
              <Text className="text-gray-400 font-medium text-base">Não tem conta? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                <Text className="text-green-600 font-black text-base">Criar conta</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default LoginScreen;
