import React from 'react';
import { TouchableOpacity, Text, TouchableOpacityProps, ActivityIndicator, View } from 'react-native';
import { useAppStore } from '../store/useAppStore';

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
  const isDarkMode = useAppStore((state) => state.isDarkMode);

  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return 'bg-green-500 active:bg-green-600';
      case 'secondary':
        return isDarkMode ? 'bg-[#334155] active:bg-[#475569]' : 'bg-gray-100 active:bg-gray-200';
      case 'outline':
        return `bg-transparent border-2 ${isDarkMode ? 'border-[#334155]' : 'border-gray-100'} active:${isDarkMode ? 'bg-white/5' : 'bg-gray-50'}`;
      case 'ghost':
        return `bg-transparent active:${isDarkMode ? 'bg-white/5' : 'bg-gray-50'}`;
      default:
        return 'bg-green-500 active:bg-green-600';
    }
  };

  const getTextStyle = () => {
    switch (variant) {
      case 'primary':
        return 'text-white';
      case 'outline':
      case 'ghost':
        return isDarkMode ? 'text-gray-300' : 'text-gray-700';
      case 'secondary':
        return isDarkMode ? 'text-white' : 'text-gray-900';
      default:
        return isDarkMode ? 'text-white' : 'text-gray-900';
    }
  };

  return (
    <TouchableOpacity
      activeOpacity={0.6}
      className={`w-full py-4 rounded-2xl items-center justify-center flex-row transition-all ${getVariantStyles()} ${props.disabled || loading ? 'opacity-60' : ''}`}
      {...props}
      disabled={props.disabled || loading}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'primary' ? 'white' : '#10B981'} />
      ) : (
        <Text className={`text-base font-extrabold tracking-tight ${getTextStyle()}`}>
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
};
