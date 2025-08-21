/**
 * 앱에서 사용하는 공통 타입 정의
 */

export interface User {
  id: string;
  email: string;
  nickname: string;
  profileImage?: string;
  points: number;
  totalTransactions: number;
  rating: number;
  createdAt: string;
}

export interface Auction {
  id: string;
  title: string;
  description: string;
  category: string;
  condition: string;
  startPrice: number;
  currentPrice: number;
  buyNowPrice?: number;
  imageUrls: string[];
  location: string;
  sellerId: string;
  sellerNickname: string;
  bidCount: number;
  startTime: string;
  endTime: string;
  status: 'active' | 'ended' | 'cancelled';
  createdAt: string;
  updatedAt: string;
}

export interface Bid {
  id: string;
  auctionId: string;
  bidderId: string;
  bidderNickname: string;
  amount: number;
  createdAt: string;
}

export interface Transaction {
  id: string;
  auctionId: string;
  sellerId: string;
  buyerId: string;
  finalPrice: number;
  status: 'pending' | 'completed' | 'cancelled';
  createdAt: string;
  completedAt?: string;
}

export interface NotificationData {
  id: string;
  userId: string;
  type: 'bid' | 'auction_end' | 'transaction' | 'system';
  title: string;
  message: string;
  isRead: boolean;
  data?: Record<string, any>;
  createdAt: string;
}

// API 응답 타입
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// 폼 데이터 타입
export interface AuctionFormData {
  title: string;
  description: string;
  category: string;
  condition: string;
  startPrice: string;
  buyNowPrice: string;
  duration: string;
  location: string;
  images: string[];
}

export interface LoginFormData {
  email: string;
  password: string;
}

export interface SignUpFormData {
  email: string;
  password: string;
  confirmPassword: string;
  nickname: string;
  agreeToTerms: boolean;
}

// 검색 및 필터링
export interface SearchFilters {
  query?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  condition?: string;
  location?: string;
  sortBy?: 'newest' | 'price_low' | 'price_high' | 'ending_soon';
}

// 네비게이션 파라미터
export type RootStackParamList = {
  Splash: undefined;
  Auth: undefined;
  Main: undefined;
  AuctionDetail: { auctionId: string };
  AuctionCreate: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  MyAuctions: undefined;
  Profile: undefined;
};

export type AuthStackParamList = {
  Login: undefined;
  SignUp: undefined;
};