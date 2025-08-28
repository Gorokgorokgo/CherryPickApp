import React from 'react';
import { TextStyle } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

// 현재 사용 중인 아이콘 이름을 Material Design Icons로 매핑
const iconMapping = {
  home: 'home',
  chat: 'chat',
  favorite: 'favorite',
  'favorite-border': 'favorite-border',
  notifications: 'notifications',
  person: 'person',
  gavel: 'gavel',
  'location-on': 'location-on',
  search: 'search',
  'filter-list': 'filter-list',
  add: 'add',
  close: 'close',
  check: 'check',
  image: 'image',
  'arrow-back': 'arrow-back',
  'chevron-right': 'chevron-right',
  'arrow-forward': 'arrow-forward',
  settings: 'settings',
  help: 'help-circle',
  info: 'information',
  warning: 'alert',
  error: 'alert-circle',
  refresh: 'refresh',
  camera: 'camera',
  'photo-library': 'image-multiple',
  star: 'star',
  'star-border': 'star-outline',
  visibility: 'eye',
  'visibility-off': 'eye-off',
  schedule: 'clock',
  'account-balance-wallet': 'wallet',
  'credit-card': 'credit-card',
  receipt: 'receipt',
  logout: 'logout',
  'delete-forever': 'delete-forever',
  lock: 'lock',
  phone: 'phone',
  block: 'block-helper',
  'support-agent': 'headset',
  description: 'file-document',
  'privacy-tip': 'shield-lock',
  'add-circle': 'plus-circle',
  'remove-circle': 'minus-circle',
  'error-outline': 'alert-circle-outline',
  'info-outline': 'information-outline',
  'help-outline': 'help-circle-outline',
  payment: 'credit-card',
  campaign: 'bullhorn',
  'receipt-long': 'receipt',
} as const;

export type IconName = keyof typeof iconMapping;

interface IconProps {
  name: IconName;
  size?: number;
  color?: string;
  style?: TextStyle;
}

export const Icon: React.FC<IconProps> = ({ 
  name, 
  size = 24, 
  color = '#333333',
  style 
}) => {
  const materialIconName = iconMapping[name] || 'help';

  return (
    <MaterialIcons
      name={materialIconName}
      size={size}
      color={color}
      style={style}
    />
  );
};


export default Icon;