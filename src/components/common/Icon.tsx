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
  help: 'help',
  info: 'info',
  warning: 'warning',
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
  campaign: 'announcement',
  'receipt-long': 'receipt',
  // 추천 아이콘 추가
  history: 'history',
  'headset-mic': 'headset-mic',
  'view-list': 'view-list',
  'grid-view': 'grid-view',
  category: 'category',
  'exit-to-app': 'exit-to-app',
  message: 'send',
  'chat-bubble': 'chat-bubble',
  'chat-bubble-outline': 'chat-bubble-outline',
  announcement: 'announcement',
  loyalty: 'card-giftcard',
  badge: 'verified',
  'account-balance': 'account-balance',
  savings: 'savings',
  send: 'send',
  // 추가 매핑 - 물음표 방지
  'star-half': 'star-half',
  'account-circle': 'account-circle',
  email: 'email',
  edit: 'edit',
  'person-remove': 'person-remove',
  login: 'login',
  'person-add': 'person-add',
  lightbulb: 'lightbulb',
  'add-a-photo': 'add-a-photo',
  'keyboard-arrow-down': 'keyboard-arrow-down',
  'notifications-off': 'notifications-off',
  'check-circle': 'check-circle',
  'chat-bubble': 'chat-bubble',
  'credit-card': 'credit-card',
  // 채팅 및 기타 아이콘 추가
  'more-vert': 'more-vert',
  handshake: 'handshake',
  share: 'share',
  // 포인트 관련 아이콘 추가
  paid: 'paid',
  payments: 'payments',
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