import React from 'react';
import { TouchableOpacity, Text, TouchableOpacityProps, ActivityIndicator, View } from 'react-native';

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
  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return 'bg-green-500 active:bg-green-600';
      case 'secondary':
        return 'bg-gray-100 active:bg-gray-200';
      case 'outline':
        return 'bg-white border-2 border-gray-100 active:bg-gray-50';
      case 'ghost':
        return 'bg-transparent active:bg-gray-50';
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
        return 'text-gray-700';
      case 'secondary':
        return 'text-gray-900';
      default:
        return 'text-gray-900';
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
