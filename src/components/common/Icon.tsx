import React from 'react';
import { Text, StyleSheet, TextStyle } from 'react-native';
import { icons, IconName } from '../../assets/icons';

interface IconProps {
  name: IconName;
  size?: number;
  color?: string;
  style?: TextStyle;
}

export const Icon: React.FC<IconProps> = ({ 
  name, 
  size = 24, 
  color = '#000000',
  style 
}) => {
  const iconText = icons[name] || '❓';

  return (
    <Text
      style={[
        styles.icon,
        {
          fontSize: size,
          color,
        },
        style,
      ]}
    >
      {iconText}
    </Text>
  );
};

const styles = StyleSheet.create({
  icon: {
    textAlign: 'center',
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
});

export default Icon;