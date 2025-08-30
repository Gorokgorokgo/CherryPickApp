/**
 * 경매 목록 관련 유틸리티 함수들
 * TDD 방식으로 구현된 비즈니스 로직
 */

import type { AuctionItem, AuctionSearchRequest } from '../services/api';

// === 시간 관련 함수들 ===

/**
 * 남은 시간 계산 결과 타입
 */
export interface TimeRemaining {
  totalMs: number;
  hours: number;
  minutes: number;
  seconds: number;
}

/**
 * 경매 종료 시간까지 남은 시간을 계산합니다
 */
export function calculateTimeRemaining(endAt: string): TimeRemaining {
  try {
    const endTime = new Date(endAt);
    const currentTime = new Date();
    
    // 날짜가 유효하지 않은 경우 (NaN) 체크
    if (isNaN(endTime.getTime()) || isNaN(currentTime.getTime())) {
      return { totalMs: 0, hours: 0, minutes: 0, seconds: 0 };
    }
    
    const diff = endTime.getTime() - currentTime.getTime();

    if (diff <= 0) {
      return { totalMs: 0, hours: 0, minutes: 0, seconds: 0 };
    }

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    return {
      totalMs: diff,
      hours,
      minutes,
      seconds,
    };
  } catch (error) {
    // 잘못된 날짜 문자열인 경우 0으로 반환
    return { totalMs: 0, hours: 0, minutes: 0, seconds: 0 };
  }
}

/**
 * 남은 시간을 한국어로 포맷팅합니다
 */
export function formatTimeLeft(timeMs: number): string {
  // 완전히 음수일 때만 종료됨 표시 (0초는 표시)
  if (timeMs < 0) {
    return '종료됨';
  }

  const hours = Math.floor(timeMs / (1000 * 60 * 60));
  const minutes = Math.floor((timeMs % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((timeMs % (1000 * 60)) / 1000);

  const parts: string[] = [];
  
  if (hours > 0) {
    parts.push(`${hours}시간`);
  }
  if (minutes > 0 || hours > 0) { // 시간이 있으면 분도 항상 표시 (0분이라도)
    parts.push(`${minutes}분`);
  }
  
  // 항상 초를 표시 (0초도 포함)
  parts.push(`${seconds}초`);

  return parts.join(' ');
}

/**
 * 경매가 만료되었는지 확인합니다
 */
export function isAuctionExpired(auction: AuctionItem): boolean {
  try {
    const endTime = new Date(auction.endAt);
    return new Date() >= endTime;
  } catch {
    return true; // 잘못된 날짜면 만료된 것으로 간주
  }
}

// === 가격 포맷팅 함수들 ===

/**
 * 가격을 한국어 천 단위 구분자와 함께 포맷팅합니다
 */
export function formatAuctionPrice(price: number): string {
  return price.toLocaleString('ko-KR') + '원';
}

/**
 * 입찰 수를 한국어로 포맷팅합니다
 */
export function formatBidCount(bidCount: number): string {
  if (bidCount === 0) {
    return '입찰 없음';
  }
  return `${bidCount}회 입찰`;
}

// === 경매 상태 관련 함수들 ===

/**
 * 경매 상태를 반환합니다
 */
export function getAuctionStatus(auction: AuctionItem): 'active' | 'ended' | 'expired' {
  if (auction.status === 'ENDED' || auction.status === 'NO_RESERVE_MET' || auction.status === 'CANCELLED') {
    return 'ended';
  }
  
  if (isAuctionExpired(auction)) {
    return 'expired';
  }
  
  return 'active';
}

// === 검색 및 필터링 관련 함수들 ===

/**
 * 검색 조건을 API 파라미터로 변환합니다
 */
export function createSearchParams(criteria: {
  keyword?: string;
  category?: string;
  regionScope?: string;
  regionCode?: string;
  minPrice?: number;
  maxPrice?: number;
  status?: string;
  sortBy?: AuctionSearchRequest['sortBy'];
  endingSoonHours?: number;
  minBidCount?: number;
}): AuctionSearchRequest {
  const params: AuctionSearchRequest = {};

  // 빈 문자열이나 undefined 값들은 제외
  if (criteria.keyword && criteria.keyword.trim()) {
    params.keyword = criteria.keyword.trim();
  }
  if (criteria.category) params.category = criteria.category;
  if (criteria.regionScope) params.regionScope = criteria.regionScope;
  if (criteria.regionCode) params.regionCode = criteria.regionCode;
  if (criteria.minPrice !== undefined && criteria.minPrice >= 0) params.minPrice = criteria.minPrice;
  if (criteria.maxPrice !== undefined && criteria.maxPrice >= 0) params.maxPrice = criteria.maxPrice;
  if (criteria.status) params.status = criteria.status;
  if (criteria.sortBy) params.sortBy = criteria.sortBy;
  if (criteria.endingSoonHours !== undefined && criteria.endingSoonHours > 0) {
    params.endingSoonHours = criteria.endingSoonHours;
  }
  if (criteria.minBidCount !== undefined && criteria.minBidCount >= 0) {
    params.minBidCount = criteria.minBidCount;
  }

  return params;
}

/**
 * 로컬에서 경매 목록을 필터링합니다 (API 검색을 보완)
 */
export function filterAuctions(
  auctions: AuctionItem[],
  criteria: {
    keyword?: string;
    category?: string;
    minPrice?: number;
    maxPrice?: number;
    status?: string;
  }
): AuctionItem[] {
  return auctions.filter(auction => {
    // 키워드 검색 (제목과 설명에서 검색)
    if (criteria.keyword) {
      const keyword = criteria.keyword.toLowerCase();
      const titleMatch = auction.title.toLowerCase().includes(keyword);
      const descriptionMatch = auction.description.toLowerCase().includes(keyword);
      if (!titleMatch && !descriptionMatch) return false;
    }

    // 카테고리 필터링
    if (criteria.category && auction.category !== criteria.category) {
      return false;
    }

    // 가격 범위 필터링
    if (criteria.minPrice !== undefined && auction.currentPrice < criteria.minPrice) {
      return false;
    }
    if (criteria.maxPrice !== undefined && auction.currentPrice > criteria.maxPrice) {
      return false;
    }

    // 상태 필터링
    if (criteria.status && auction.status !== criteria.status) {
      return false;
    }

    return true;
  });
}

/**
 * 경매 목록을 정렬합니다
 */
export function sortAuctions(
  auctions: AuctionItem[],
  sortBy: AuctionSearchRequest['sortBy'] = 'CREATED_DESC'
): AuctionItem[] {
  const sortedAuctions = [...auctions];

  switch (sortBy) {
    case 'PRICE_ASC':
      return sortedAuctions.sort((a, b) => a.currentPrice - b.currentPrice);
    
    case 'PRICE_DESC':
      return sortedAuctions.sort((a, b) => b.currentPrice - a.currentPrice);
    
    case 'ENDING_SOON':
      return sortedAuctions.sort((a, b) => {
        const timeA = new Date(a.endAt).getTime();
        const timeB = new Date(b.endAt).getTime();
        return timeA - timeB; // 가장 빨리 끝나는 것부터
      });
    
    case 'VIEW_COUNT_DESC':
      return sortedAuctions.sort((a, b) => b.viewCount - a.viewCount);
    
    case 'BID_COUNT_DESC':
      return sortedAuctions.sort((a, b) => b.bidCount - a.bidCount);
    
    case 'CREATED_ASC':
      return sortedAuctions.sort((a, b) => {
        const dateA = new Date(a.createdAt).getTime();
        const dateB = new Date(b.createdAt).getTime();
        return dateA - dateB;
      });
    
    case 'CREATED_DESC':
    default:
      return sortedAuctions.sort((a, b) => {
        const dateA = new Date(a.createdAt).getTime();
        const dateB = new Date(b.createdAt).getTime();
        return dateB - dateA; // 최신 순
      });
  }
}

// === 데이터 변환 함수들 ===

/**
 * API 응답의 경매 아이템을 화면에 표시할 형태로 변환합니다
 */
export function transformAuctionForDisplay(auction: AuctionItem) {
  const timeRemaining = calculateTimeRemaining(auction.endAt);
  const status = getAuctionStatus(auction);
  
  return {
    ...auction,
    formattedPrice: formatAuctionPrice(auction.currentPrice),
    formattedStartPrice: formatAuctionPrice(auction.startPrice),
    formattedTimeLeft: formatTimeLeft(timeRemaining.totalMs),
    formattedBidCount: formatBidCount(auction.bidCount),
    timeRemaining,
    displayStatus: status,
    isExpired: status === 'expired',
    isEnded: status === 'ended',
    isActive: status === 'active',
  };
}

/**
 * 경매 목록 전체를 화면 표시용으로 변환합니다
 */
export function transformAuctionListForDisplay(auctions: AuctionItem[]) {
  return auctions.map(transformAuctionForDisplay);
}