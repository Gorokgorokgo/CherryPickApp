import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  ActivityIndicator,
} from 'react-native';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'text';
type ButtonSize = 'small' | 'medium' | 'large';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export default function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  style,
  textStyle,
}: ButtonProps) {
  const getButtonStyle = (): ViewStyle[] => {
    const baseStyles = [styles.button, styles[`button_${variant}`], styles[`button_${size}`]];
    
    if (disabled || loading) {
      baseStyles.push(styles.buttonDisabled);
    }
    
    if (style) {
      baseStyles.push(style);
    }
    
    return baseStyles;
  };

  const getTextStyle = (): TextStyle[] => {
    const baseStyles = [styles.buttonText, styles[`buttonText_${variant}`], styles[`buttonText_${size}`]];
    
    if (disabled || loading) {
      baseStyles.push(styles.buttonTextDisabled);
    }
    
    if (textStyle) {
      baseStyles.push(textStyle);
    }
    
    return baseStyles;
  };

  return (
    <TouchableOpacity
      style={getButtonStyle()}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator 
          size="small" 
          color={variant === 'primary' ? '#FFFFFF' : '#FF6B6B'} 
        />
      ) : (
        <Text style={getTextStyle()}>{title}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  // Base button styles
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  buttonText: {
    fontWeight: '600',
    textAlign: 'center',
  },
  
  // Variant styles
  button_primary: {
    backgroundColor: '#FF6B6B',
  },
  button_secondary: {
    backgroundColor: '#F8F8F8',
  },
  button_outline: {
    backgroundColor: 'transparent',
    borderColor: '#FF6B6B',
  },
  button_text: {
    backgroundColor: 'transparent',
  },
  
  buttonText_primary: {
    color: '#FFFFFF',
  },
  buttonText_secondary: {
    color: '#333333',
  },
  buttonText_outline: {
    color: '#FF6B6B',
  },
  buttonText_text: {
    color: '#FF6B6B',
  },
  
  // Size styles
  button_small: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    minHeight: 32,
  },
  button_medium: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    minHeight: 44,
  },
  button_large: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    minHeight: 52,
  },
  
  buttonText_small: {
    fontSize: 14,
  },
  buttonText_medium: {
    fontSize: 16,
  },
  buttonText_large: {
    fontSize: 18,
  },
  
  // Disabled styles
  buttonDisabled: {
    backgroundColor: '#CCCCCC',
    borderColor: '#CCCCCC',
  },
  buttonTextDisabled: {
    color: '#999999',
  },
});