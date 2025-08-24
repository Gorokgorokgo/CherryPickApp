/**
 * 앱에서 사용하는 상수들
 */

// 색상 상수
export const COLORS = {
  primary: '#FF6B6B',
  secondary: '#4ECDC4',
  success: '#28A745',
  warning: '#FFC107',
  error: '#DC3545',
  info: '#17A2B8',
  
  // 그레이 스케일
  white: '#FFFFFF',
  light: '#F8F9FA',
  gray100: '#F8F8F8',
  gray200: '#E9ECEF',
  gray300: '#DEE2E6',
  gray400: '#CED4DA',
  gray500: '#ADB5BD',
  gray600: '#6C757D',
  gray700: '#495057',
  gray800: '#343A40',
  gray900: '#212529',
  black: '#000000',
  
  // 텍스트
  textPrimary: '#333333',
  textSecondary: '#666666',
  textMuted: '#999999',
  
  // 배경
  background: '#FFFFFF',
  backgroundLight: '#FAFAFA',
  backgroundDark: '#F5F5F5',
} as const;

// 스페이싱 상수
export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

// 폰트 크기
export const FONT_SIZES = {
  xs: 10,
  sm: 12,
  md: 14,
  lg: 16,
  xl: 18,
  xxl: 20,
  title: 24,
  heading: 28,
  display: 32,
} as const;

// 폰트 굵기
export const FONT_WEIGHTS = {
  normal: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
} as const;

// 보더 반경
export const BORDER_RADIUS = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  round: 9999,
} as const;

// 카테고리 목록
export const CATEGORIES = [
  { value: 'electronics', label: '전자제품' },
  { value: 'fashion', label: '패션' },
  { value: 'home', label: '생활용품' },
  { value: 'sports', label: '스포츠' },
  { value: 'books', label: '도서' },
  { value: 'beauty', label: '뷰티' },
  { value: 'automotive', label: '자동차용품' },
  { value: 'etc', label: '기타' },
] as const;

// 상품 상태 목록
export const CONDITIONS = [
  { value: 'new', label: '새상품' },
  { value: 'like-new', label: '거의 새것' },
  { value: 'good', label: '좋음' },
  { value: 'fair', label: '보통' },
  { value: 'poor', label: '나쁨' },
] as const;

// 경매 기간 옵션
export const DURATIONS = [
  { value: '1', label: '1일' },
  { value: '3', label: '3일' },
  { value: '5', label: '5일' },
  { value: '7', label: '7일' },
] as const;

// 정렬 옵션
export const SORT_OPTIONS = [
  { value: 'newest', label: '최신순' },
  { value: 'price_low', label: '낮은 가격순' },
  { value: 'price_high', label: '높은 가격순' },
  { value: 'ending_soon', label: '마감 임박순' },
] as const;

// API 엔드포인트 (개발용)
export const API_ENDPOINTS = {
  BASE_URL: __DEV__ ? 'http://10.0.2.2:8080/api' : 'https://api.cherrypick.com/api',
  AUCTIONS: '/auctions',
  USERS: '/users',
  BIDS: '/bids',
  AUTH: '/auth',
} as const;