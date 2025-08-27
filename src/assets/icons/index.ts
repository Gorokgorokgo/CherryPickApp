// 아이콘 이미지 파일들을 임포트
// 실제 아이콘 파일들이 있다면 이런 식으로 사용:
// export const home = require('./home.png');
// export const chat = require('./chat.png');
// export const favorite = require('./favorite.png');
// export const notifications = require('./notifications.png');
// export const profile = require('./profile.png');

// 임시로 Text 기반 아이콘 사용
export const icons = {
  home: '🏠',
  chat: '💬',
  favorite: '❤️',
  'favorite-border': '🤍',
  notifications: '🔔',
  person: '👤',
  gavel: '🔨',
  'location-on': '📍',
  search: '🔍',
  'filter-list': '📊',
  add: '➕',
  close: '✖️',
  check: '✅',
  image: '🖼️',
};

export type IconName = keyof typeof icons;