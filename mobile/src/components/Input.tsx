import React, { useState } from 'react';
import { View, TextInput, TextInputProps, Text } from 'react-native';
import { LucideIcon } from 'lucide-react-native';
import { styled } from 'nativewind';
import { useAppStore } from '../store/useAppStore';

const StyledView = styled(View);

interface InputProps extends TextInputProps {
  icon?: LucideIcon;
  label?: string;
  error?: string;
}

export const Input: React.FC<InputProps> = ({ icon: Icon, label, error, ...props }) => {
  const [isFocused, setIsFocused] = useState(false);
  const isDarkMode = useAppStore((state) => state.isDarkMode);

  const labelColor = isDarkMode ? 'text-gray-300' : 'text-gray-800';
  const textColor = isDarkMode ? 'text-white' : 'text-gray-900';
  const inputBg = isDarkMode ? 'bg-[#1E293B]' : 'bg-gray-50';
  const borderColor = isDarkMode ? 'border-[#334155]' : 'border-gray-100';

  return (
    <View className="mb-5 w-full">
      {label && (
        <Text className={`${labelColor} mb-2 font-bold text-sm tracking-tight`}>
          {label}
        </Text>
      )}
      <View 
        className={`flex-row items-center ${inputBg} border-2 rounded-2xl px-4 py-3.5 transition-all ${
          error 
            ? 'border-red-500 bg-red-50' 
            : isFocused 
              ? 'border-green-500 bg-transparent' 
              : borderColor
        }`}
      >
        {Icon && (
          <View className="mr-3">
            <Icon 
              size={20} 
              color={error ? '#EF4444' : isFocused ? '#10B981' : isDarkMode ? '#475569' : '#9CA3AF'} 
            />
          </View>
        )}
        <TextInput
          className={`flex-1 ${textColor} text-[16px] font-medium leading-tight`}
          placeholderTextColor={isDarkMode ? '#475569' : '#9CA3AF'}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          {...props}
        />
      </View>
      {error && (
        <View className="flex-row items-center mt-2 ml-1">
          <View className="w-1 h-1 bg-red-500 rounded-full mr-2" />
          <Text className="text-red-500 text-xs font-bold tracking-tight">{error}</Text>
        </View>
      )}
    </View>
  );
};
