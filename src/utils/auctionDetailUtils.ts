/**
 * 경매 상세 화면 관련 유틸리티 함수들
 * TDD 방식으로 구현된 비즈니스 로직
 */

import { formatAuctionPrice, calculateTimeRemaining, formatTimeLeft } from './auctionListUtils';

// === 입찰 관련 함수들 ===

/**
 * 입찰 검증 결과 타입
 */
export interface BidValidationResult {
  isValid: boolean;
  error: string | null;
}

/**
 * 입찰 금액을 검증합니다
 */
export function validateBidAmount(
  bidAmount: number,
  currentPrice: number,
  minimumIncrement: number
): BidValidationResult {
  // 음수나 0원 체크
  if (bidAmount <= 0) {
    return {
      isValid: false,
      error: '유효한 금액을 입력해주세요.',
    };
  }

  // 현재가보다 낮은지 체크
  if (bidAmount <= currentPrice) {
    return {
      isValid: false,
      error: '현재 입찰가보다 높은 금액을 입력해주세요.',
    };
  }

  // 최소 증가액보다 작은지 체크
  const requiredMinimum = currentPrice + minimumIncrement;
  if (bidAmount < requiredMinimum) {
    return {
      isValid: false,
      error: `최소 ${formatAuctionPrice(requiredMinimum)} 이상 입찰해주세요.`,
    };
  }

  return {
    isValid: true,
    error: null,
  };
}

/**
 * 현재 가격에 따라 최소 입찰 증가율을 계산합니다 (5% 고정)
 * 비즈니스 로직: 현재가의 5% 이상 증가, 100원 단위
 */
export function calculateBidIncrement(currentPrice: number): number {
  if (currentPrice <= 0) {
    return 100; // 기본 최소 증가액
  }

  // 현재가의 5% 계산
  const fivePercent = Math.ceil(currentPrice * 0.05);
  
  // 100원 단위로 올림
  return Math.ceil(fivePercent / 100) * 100;
}

// === 텍스트 검증 함수들 ===

/**
 * 텍스트 검증 결과 타입
 */
export interface TextValidationResult {
  isValid: boolean;
  error: string | null;
}

/**
 * 질문 텍스트를 검증합니다
 */
export function validateQuestionText(text: string): TextValidationResult {
  const trimmedText = text.trim();

  if (trimmedText.length === 0) {
    return {
      isValid: false,
      error: '질문을 입력해주세요.',
    };
  }

  if (trimmedText.length > 1000) {
    return {
      isValid: false,
      error: '질문은 1000자 이하로 입력해주세요.',
    };
  }

  return {
    isValid: true,
    error: null,
  };
}

// === 포맷팅 함수들 ===

/**
 * 판매자 평점을 포맷팅합니다 (0.0 ~ 5.0 범위로 제한)
 */
export function formatSellerRating(rating: number): string {
  if (rating < 0) return '0.0';
  if (rating > 5) return '5.0';
  
  // 반올림을 명시적으로 처리
  return (Math.round(rating * 10) / 10).toFixed(1);
}

/**
 * 판매자 후기 수를 계산합니다
 */
export function calculateReviewCount(rating: number): number {
  // 평점 기준으로 대략적인 후기 수 계산 (실제로는 백엔드에서 제공)
  return Math.floor(rating * 50);
}

// === 데이터 변환 함수들 ===

/**
 * 화면 표시용 경매 상세 데이터 타입
 */
export interface AuctionDetailDisplay {
  // 원본 데이터
  id: number;
  title: string;
  description?: string;
  currentPrice: number;
  startPrice?: number;
  hopePrice?: number;
  bidCount?: number;
  sellerNickname?: string;
  endAt: string;
  category?: string;
  regionName?: string;
  imageUrls?: string[];
  viewCount?: number;
  condition?: number; // 상품 상태 점수 (1-10)
  purchaseDate?: string; // 구매일
  sellerLevel?: string; // 판매자 레벨
  sellerRating?: number; // 판매자 평점
  
  // 변환된 표시용 데이터
  formattedCurrentPrice: string;
  formattedStartPrice: string;
  formattedHopePrice: string;
  timeLeftText: string;
  minimumBidIncrement: number;
  hasImages: boolean;
  imageCount: number;
  isExpired: boolean;
  formattedBidCount: string;
}

/**
 * API 데이터를 화면 표시용으로 변환합니다
 */
export function transformAuctionDetailForDisplay(apiData: any): AuctionDetailDisplay {
  const timeRemaining = calculateTimeRemaining(apiData.endAt);
  const timeLeftText = formatTimeLeft(timeRemaining.totalMs);
  const isExpired = timeRemaining.totalMs <= 0;
  const minimumBidIncrement = calculateBidIncrement(apiData.currentPrice || 0);
  
  return {
    // 원본 데이터
    id: apiData.id,
    title: apiData.title,
    description: apiData.description,
    currentPrice: apiData.currentPrice || 0,
    startPrice: apiData.startPrice,
    hopePrice: apiData.hopePrice,
    bidCount: apiData.bidCount || 0,
    sellerNickname: apiData.sellerNickname,
    endAt: apiData.endAt,
    category: apiData.category,
    regionName: apiData.regionName,
    imageUrls: apiData.imageUrls || [],
    viewCount: apiData.viewCount || 0,
    condition: apiData.condition || 7, // 기본값 7점
    purchaseDate: apiData.purchaseDate || '구매일 정보 없음',
    sellerLevel: apiData.sellerLevel || 'Lv1',
    sellerRating: apiData.sellerRating || 4.5,
    
    // 변환된 표시용 데이터
    formattedCurrentPrice: formatAuctionPrice(apiData.currentPrice || 0),
    formattedStartPrice: formatAuctionPrice(apiData.startPrice || 0),
    formattedHopePrice: formatAuctionPrice(apiData.hopePrice || 0),
    timeLeftText,
    minimumBidIncrement,
    hasImages: (apiData.imageUrls && apiData.imageUrls.length > 0) || false,
    imageCount: (apiData.imageUrls && apiData.imageUrls.length) || 0,
    isExpired,
    formattedBidCount: apiData.bidCount ? `${apiData.bidCount}회 입찰` : '입찰 없음',
  };
}

// === 상태 관련 함수들 ===

/**
 * 경매 종료까지 남은 시간을 체크하여 긴급도를 반환합니다
 */
export function getAuctionUrgency(endAt: string): 'high' | 'medium' | 'low' | 'expired' {
  const timeRemaining = calculateTimeRemaining(endAt);
  const hoursLeft = timeRemaining.totalMs / (1000 * 60 * 60);

  if (hoursLeft <= 0) return 'expired';
  if (hoursLeft <= 1) return 'high';    // 1시간 이내
  if (hoursLeft <= 6) return 'medium';  // 6시간 이내
  return 'low';
}

/**
 * 입찰 참여도를 분석합니다
 */
export function analyzeBidActivity(bidCount: number, viewCount: number): {
  level: 'high' | 'medium' | 'low';
  percentage: number;
} {
  if (viewCount === 0) {
    return { level: 'low', percentage: 0 };
  }

  const percentage = (bidCount / viewCount) * 100;

  if (percentage >= 10) return { level: 'high', percentage };
  if (percentage >= 5) return { level: 'medium', percentage };
  return { level: 'low', percentage };
}

/**
 * 가격 상승률을 계산합니다
 */
export function calculatePriceIncrease(currentPrice: number, startPrice: number): {
  amount: number;
  percentage: number;
  formattedAmount: string;
  formattedPercentage: string;
} {
  if (startPrice <= 0) {
    return {
      amount: 0,
      percentage: 0,
      formattedAmount: '0원',
      formattedPercentage: '0%',
    };
  }

  const amount = currentPrice - startPrice;
  const percentage = (amount / startPrice) * 100;

  return {
    amount,
    percentage,
    formattedAmount: formatAuctionPrice(amount),
    formattedPercentage: `${percentage.toFixed(1)}%`,
  };
}