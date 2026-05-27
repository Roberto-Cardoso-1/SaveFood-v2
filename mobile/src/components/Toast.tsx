import React, { useEffect, useRef } from 'react';
import { Animated, Text, View } from 'react-native';
import { CheckCircle2, AlertCircle } from 'lucide-react-native';
import { useTheme } from '../hooks/useTheme';

interface Props {
  visible: boolean;
  message: string;
  variant?: 'success' | 'error';
  duration?: number;
  onHide?: () => void;
}

export const Toast: React.FC<Props> = ({
  visible,
  message,
  variant = 'success',
  duration = 1500,
  onHide,
}) => {
  const t = useTheme();
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(-20)).current;

  useEffect(() => {
    if (!visible) return;
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 300, useNativeDriver: true }),
      Animated.timing(translateY, { toValue: 0, duration: 300, useNativeDriver: true }),
    ]).start();
    const timeout = setTimeout(() => {
      Animated.parallel([
        Animated.timing(opacity, { toValue: 0, duration: 300, useNativeDriver: true }),
        Animated.timing(translateY, { toValue: -20, duration: 300, useNativeDriver: true }),
      ]).start(() => onHide?.());
    }, duration);
    return () => clearTimeout(timeout);
  }, [visible, duration, onHide, opacity, translateY]);

  if (!visible) return null;

  const isError = variant === 'error';
  const Icon = isError ? AlertCircle : CheckCircle2;
  const accent = isError ? '#EF4444' : t.brand;

  return (
    <Animated.View
      pointerEvents="none"
      style={{
        opacity,
        transform: [{ translateY }],
        position: 'absolute',
        top: 60,
        left: 24,
        right: 24,
        zIndex: 100,
      }}
    >
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: t.isDark ? t.card : isError ? '#DC2626' : '#059669',
          paddingHorizontal: 24,
          paddingVertical: 16,
          borderRadius: 24,
          borderWidth: 1,
          borderColor: accent,
        }}
      >
        <Icon size={24} color={accent} />
        <Text style={{ color: 'white', fontWeight: '900', marginLeft: 16, flex: 1 }}>
          {message}
        </Text>
      </View>
    </Animated.View>
  );
};
