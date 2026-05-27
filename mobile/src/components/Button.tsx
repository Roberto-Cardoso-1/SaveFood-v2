import React from 'react';
import { TouchableOpacity, Text, TouchableOpacityProps, ActivityIndicator } from 'react-native';
import { useTheme } from '../hooks/useTheme';

interface ButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  loading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  variant = 'primary',
  loading = false,
  ...props
}) => {
  const t = useTheme();

  const styles = (() => {
    switch (variant) {
      case 'primary':
        return 'bg-green-500 active:bg-green-600';
      case 'secondary':
        return t.isDark
          ? 'bg-[#334155] active:bg-[#475569]'
          : 'bg-gray-100 active:bg-gray-200';
      case 'outline':
        return `bg-transparent border-2 ${t.isDark ? 'border-[#334155]' : 'border-gray-100'}`;
      case 'ghost':
        return 'bg-transparent';
    }
  })();

  const textClass = (() => {
    switch (variant) {
      case 'primary':
        return 'text-white';
      case 'outline':
      case 'ghost':
        return t.isDark ? 'text-gray-300' : 'text-gray-700';
      case 'secondary':
        return t.isDark ? 'text-white' : 'text-gray-900';
    }
  })();

  const disabled = !!(props.disabled || loading);

  return (
    <TouchableOpacity
      activeOpacity={0.6}
      {...props}
      disabled={disabled}
      className={`w-full py-4 rounded-2xl items-center justify-center flex-row ${styles} ${
        disabled ? 'opacity-60' : ''
      }`}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'primary' ? 'white' : t.brand} />
      ) : (
        <Text className={`text-base font-extrabold tracking-tight ${textClass}`}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};
