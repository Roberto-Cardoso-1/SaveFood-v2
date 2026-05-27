import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Platform, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NativeWindStyleSheet } from 'nativewind';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import './global.css';

import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import ForgotPasswordScreen from './src/screens/ForgotPasswordScreen';
import HomeScreen from './src/screens/HomeScreen';
import DonateScreen from './src/screens/DonateScreen';
import ConfirmationScreen from './src/screens/ConfirmationScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import MapScreen from './src/screens/MapScreen';

import { useAuthStore } from './src/store/useAuthStore';
import { authService } from './src/services/auth';
import { useTheme } from './src/hooks/useTheme';

NativeWindStyleSheet.setOutput({ default: 'native', web: 'css' });

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function TabNavigator() {
  const user = useAuthStore((s) => s.user);
  const isDoador = user?.tipo_perfil === 'Doador';

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: { display: 'none' },
      }}
    >
      <Tab.Screen name="Início" component={HomeScreen} />
      {isDoador && <Tab.Screen name="Doar" component={DonateScreen} />}
      <Tab.Screen name="Mapa" component={MapScreen} />
      <Tab.Screen name="Perfil" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

function SplashScreen() {
  const t = useTheme();
  return (
    <View style={{ flex: 1, backgroundColor: t.bg, alignItems: 'center', justifyContent: 'center' }}>
      <ActivityIndicator size="large" color={t.brand} />
    </View>
  );
}

export default function App() {
  const user = useAuthStore((s) => s.user);
  const hasHydrated = useAuthStore((s) => s.hasHydrated);
  const [bootstrapped, setBootstrapped] = useState(false);

  useEffect(() => {
    if (!hasHydrated) return;
    let cancelled = false;
    (async () => {
      await authService.hydrate();
      if (!cancelled) setBootstrapped(true);
    })();
    return () => {
      cancelled = true;
    };
  }, [hasHydrated]);

  if (!hasHydrated || !bootstrapped) {
    return (
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SafeAreaProvider>
          <SplashScreen />
          <StatusBar style="auto" />
        </SafeAreaProvider>
      </GestureHandlerRootView>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <NavigationContainer>
          <Stack.Navigator
            screenOptions={{
              headerShown: false,
              contentStyle:
                Platform.OS === 'web' ? { flex: 1, height: '100%' as any } : undefined,
            }}
          >
            {user === null ? (
              <>
                <Stack.Screen name="Login" component={LoginScreen} />
                <Stack.Screen name="Register" component={RegisterScreen} />
                <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
              </>
            ) : (
              <>
                <Stack.Screen name="Main" component={TabNavigator} />
                <Stack.Screen
                  name="Confirmation"
                  component={ConfirmationScreen}
                  options={{ presentation: 'modal' }}
                />
              </>
            )}
          </Stack.Navigator>
          <StatusBar style="auto" />
        </NavigationContainer>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
