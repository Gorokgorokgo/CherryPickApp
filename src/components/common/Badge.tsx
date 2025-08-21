import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
} from 'react-native';

type BadgeVariant = 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';
type BadgeSize = 'small' | 'medium' | 'large';

interface BadgeProps {
  text: string;
  variant?: BadgeVariant;
  size?: BadgeSize;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export default function Badge({
  text,
  variant = 'primary',
  size = 'medium',
  style,
  textStyle,
}: BadgeProps) {
  const getBadgeStyle = (): ViewStyle[] => {
    const baseStyles = [
      styles.badge,
      styles[`badge_${variant}`],
      styles[`badge_${size}`],
    ];
    
    if (style) {
      baseStyles.push(style);
    }
    
    return baseStyles;
  };

  const getTextStyle = (): TextStyle[] => {
    const baseStyles = [
      styles.badgeText,
      styles[`badgeText_${variant}`],
      styles[`badgeText_${size}`],
    ];
    
    if (textStyle) {
      baseStyles.push(textStyle);
    }
    
    return baseStyles;
  };

  return (
    <View style={getBadgeStyle()}>
      <Text style={getTextStyle()}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  // Base badge styles
  badge: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  badgeText: {
    fontWeight: '600',
    textAlign: 'center',
  },
  
  // Variant styles
  badge_primary: {
    backgroundColor: '#FF6B6B',
  },
  badge_secondary: {
    backgroundColor: '#6C757D',
  },
  badge_success: {
    backgroundColor: '#28A745',
  },
  badge_warning: {
    backgroundColor: '#FFC107',
  },
  badge_error: {
    backgroundColor: '#DC3545',
  },
  badge_info: {
    backgroundColor: '#17A2B8',
  },
  
  badgeText_primary: {
    color: '#FFFFFF',
  },
  badgeText_secondary: {
    color: '#FFFFFF',
  },
  badgeText_success: {
    color: '#FFFFFF',
  },
  badgeText_warning: {
    color: '#000000',
  },
  badgeText_error: {
    color: '#FFFFFF',
  },
  badgeText_info: {
    color: '#FFFFFF',
  },
  
  // Size styles
  badge_small: {
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  badge_medium: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  badge_large: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  
  badgeText_small: {
    fontSize: 10,
  },
  badgeText_medium: {
    fontSize: 12,
  },
  badgeText_large: {
    fontSize: 14,
  },
});