import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Mail, ArrowLeft, Leaf, AlertCircle, CheckCircle2 } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { authService } from '../services/auth';
import { useTheme } from '../hooks/useTheme';

const ForgotPasswordScreen = () => {
  const navigation = useNavigation<any>();
  const t = useTheme();
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleRecover = async () => {
    setError(null);
    setSuccess(null);
    if (!email) {
      setError('Por favor, informe seu e-mail.');
      return;
    }
    setLoading(true);
    try {
      const msg = await authService.requestPasswordReset(email.trim().toLowerCase());
      setSuccess(msg);
    } catch {
      setError('Erro ao processar solicitação. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const bgColor = t.isDark ? 'bg-[#0F172A]' : 'bg-white';
  const textColor = t.isDark ? 'text-white' : 'text-gray-900';
  const subTextColor = t.isDark ? 'text-gray-400' : 'text-gray-500';

  return (
    <SafeAreaView className={`flex-1 ${bgColor}`}>
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        className="px-6"
        showsVerticalScrollIndicator={false}
      >
        <View className="py-8">
          <TouchableOpacity
            className={`w-12 h-12 ${
              t.isDark ? 'bg-white/5 border-white/10' : 'bg-white border-gray-100'
            } rounded-2xl items-center justify-center border shadow-sm mb-10`}
            onPress={() => navigation.goBack()}
          >
            <ArrowLeft size={20} color={t.isDark ? 'white' : '#111827'} />
          </TouchableOpacity>

          <View className="items-center mb-10">
            <View className="w-20 h-20 bg-green-500 rounded-[28px] items-center justify-center shadow-xl shadow-green-500/20 rotate-6 mb-8">
              <Leaf size={40} color="white" fill="white" />
            </View>
            <Text className={`text-4xl font-black ${textColor} tracking-tighter text-center`}>
              Recuperar Senha
            </Text>
            <Text className={`${subTextColor} text-center text-base mt-4 px-4`}>
              Informe o e-mail da sua conta e enviaremos as instruções para você.
            </Text>
          </View>

          <View style={{ gap: 24 }}>
            <Input
              placeholder="seu@email.com"
              label="E-mail cadastrado"
              icon={Mail}
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                setError(null);
              }}
            />

            {error && (
              <View
                className={`flex-row items-center ${
                  t.isDark ? 'bg-red-500/10' : 'bg-red-50'
                } p-5 rounded-[24px] border ${
                  t.isDark ? 'border-red-500/20' : 'border-red-100'
                }`}
              >
                <AlertCircle size={20} color="#EF4444" />
                <Text className="text-red-500 font-bold text-sm flex-1 ml-3 leading-tight">
                  {error}
                </Text>
              </View>
            )}

            {success && (
              <View className="bg-green-500/10 p-6 rounded-[32px] border border-green-500/20 items-center">
                <CheckCircle2 size={48} color="#10B981" />
                <Text className="text-green-600 font-bold text-center mt-4 leading-tight">
                  {success}
                </Text>
                <TouchableOpacity
                  onPress={() => navigation.navigate('Login')}
                  className="mt-6 bg-green-500 px-8 py-3 rounded-full"
                >
                  <Text className="text-white font-black text-xs uppercase">Voltar ao Login</Text>
                </TouchableOpacity>
              </View>
            )}

            {!success && (
              <View className="shadow-2xl shadow-green-500/10 mt-4">
                <Button title="Enviar Instruções" onPress={handleRecover} loading={loading} />
              </View>
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ForgotPasswordScreen;
