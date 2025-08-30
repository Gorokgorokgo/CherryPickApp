/**
 * TDD: 경매 목록 유틸리티 함수 테스트
 * 
 * 비즈니스 로직 우선순위에 따라 테스트를 작성합니다:
 * 1. 핵심 비즈니스 로직 (데이터 가공, 계산, 상태 변화)
 * 2. 사용자 인터랙션 처리
 * 3. 시나리오 테스트
 */

import {
  formatTimeLeft,
  formatAuctionPrice,
  createSearchParams,
  filterAuctions,
  sortAuctions,
  isAuctionExpired,
  calculateTimeRemaining,
  getAuctionStatus,
  formatBidCount,
} from '../auctionListUtils';

import type { AuctionItem } from '../../services/api';

// 테스트용 더미 경매 데이터
const createMockAuction = (overrides: Partial<AuctionItem> = {}): AuctionItem => ({
  id: 1,
  title: '테스트 경매',
  description: '테스트 설명',
  category: 'ELECTRONICS',
  startPrice: 100000,
  currentPrice: 150000,
  hopePrice: 200000,
  auctionTimeHours: 24,
  regionScope: 'NATIONWIDE',
  regionCode: '',
  regionName: '전국',
  status: 'ACTIVE',
  viewCount: 10,
  bidCount: 5,
  startAt: '2024-01-01T10:00:00',
  endAt: '2024-01-02T10:00:00',
  createdAt: '2024-01-01T09:00:00',
  sellerId: 1,
  sellerNickname: '판매자',
  imageUrls: ['image1.jpg'],
  remainingTimeMs: 3600000, // 1시간 남음
  isExpired: false,
  ...overrides,
});

describe('경매 목록 비즈니스 로직 - TDD', () => {
  
  // === 1. 핵심 비즈니스 로직 테스트 ===
  
  describe('시간 계산 및 포맷팅', () => {
    
    it('남은 시간을 올바르게 계산해야 한다', () => {
      // Given
      const endAt = new Date(Date.now() + 3660000); // 1시간 1분 후 (여유시간 추가)
      
      // When
      const timeLeft = calculateTimeRemaining(endAt.toISOString());
      
      // Then
      expect(timeLeft.hours).toBe(1);
      expect(timeLeft.minutes).toBe(1);
      expect(timeLeft.totalMs).toBeGreaterThan(3659000);
      expect(timeLeft.totalMs).toBeLessThanOrEqual(3660000);
    });

    it('만료된 경매의 남은 시간이 0이어야 한다', () => {
      // Given
      const endAt = new Date(Date.now() - 1000); // 1초 전
      
      // When
      const timeLeft = calculateTimeRemaining(endAt.toISOString());
      
      // Then
      expect(timeLeft.hours).toBe(0);
      expect(timeLeft.minutes).toBe(0);
      expect(timeLeft.seconds).toBe(0);
      expect(timeLeft.totalMs).toBe(0);
    });

    it('시간을 한국어로 포맷팅해야 한다', () => {
      // Given - When - Then
      expect(formatTimeLeft(3661000)).toBe('1시간 1분 1초'); // 1시간 1분 1초
      expect(formatTimeLeft(61000)).toBe('1분 1초'); // 1분 1초
      expect(formatTimeLeft(1000)).toBe('1초'); // 1초
      expect(formatTimeLeft(0)).toBe('종료됨');
    });

    it('경매 만료 여부를 올바르게 판단해야 한다', () => {
      // Given
      const activeAuction = createMockAuction({ 
        endAt: new Date(Date.now() + 3600000).toISOString() 
      });
      const expiredAuction = createMockAuction({ 
        endAt: new Date(Date.now() - 1000).toISOString() 
      });
      
      // When - Then
      expect(isAuctionExpired(activeAuction)).toBe(false);
      expect(isAuctionExpired(expiredAuction)).toBe(true);
    });
  });

  describe('가격 포맷팅', () => {
    it('가격을 한국어 천 단위로 포맷팅해야 한다', () => {
      // Given - When - Then
      expect(formatAuctionPrice(1000)).toBe('1,000원');
      expect(formatAuctionPrice(1500000)).toBe('1,500,000원');
      expect(formatAuctionPrice(0)).toBe('0원');
    });

    it('입찰 수를 올바르게 포맷팅해야 한다', () => {
      // Given - When - Then
      expect(formatBidCount(0)).toBe('입찰 없음');
      expect(formatBidCount(1)).toBe('1회 입찰');
      expect(formatBidCount(5)).toBe('5회 입찰');
      expect(formatBidCount(100)).toBe('100회 입찰');
    });
  });

  describe('경매 상태 판단', () => {
    it('경매 상태를 올바르게 반환해야 한다', () => {
      // Given
      const activeAuction = createMockAuction({ 
        status: 'ACTIVE',
        endAt: new Date(Date.now() + 3600000).toISOString()
      });
      const endedAuction = createMockAuction({ 
        status: 'ENDED' 
      });
      const expiredAuction = createMockAuction({ 
        status: 'ACTIVE',
        endAt: new Date(Date.now() - 1000).toISOString()
      });
      
      // When - Then
      expect(getAuctionStatus(activeAuction)).toBe('active');
      expect(getAuctionStatus(endedAuction)).toBe('ended');
      expect(getAuctionStatus(expiredAuction)).toBe('expired');
    });
  });

  // === 2. 검색 및 필터링 로직 테스트 ===

  describe('검색 파라미터 생성', () => {
    it('검색 조건을 URL 파라미터로 변환해야 한다', () => {
      // Given
      const searchCriteria = {
        keyword: '아이폰',
        category: 'ELECTRONICS',
        minPrice: 100000,
        maxPrice: 500000,
        sortBy: 'PRICE_ASC' as const,
      };
      
      // When
      const params = createSearchParams(searchCriteria);
      
      // Then
      expect(params.keyword).toBe('아이폰');
      expect(params.category).toBe('ELECTRONICS');
      expect(params.minPrice).toBe(100000);
      expect(params.maxPrice).toBe(500000);
      expect(params.sortBy).toBe('PRICE_ASC');
    });

    it('빈 값들은 제외해야 한다', () => {
      // Given
      const searchCriteria = {
        keyword: '',
        category: 'ELECTRONICS',
        minPrice: undefined,
        maxPrice: 500000,
      };
      
      // When
      const params = createSearchParams(searchCriteria);
      
      // Then
      expect(params.keyword).toBeUndefined();
      expect(params.category).toBe('ELECTRONICS');
      expect(params.minPrice).toBeUndefined();
      expect(params.maxPrice).toBe(500000);
    });
  });

  describe('경매 필터링', () => {
    const auctions = [
      createMockAuction({ 
        id: 1, 
        title: '아이폰 14 Pro', 
        currentPrice: 800000, 
        category: 'ELECTRONICS' 
      }),
      createMockAuction({ 
        id: 2, 
        title: '갤럭시 S23', 
        currentPrice: 600000, 
        category: 'ELECTRONICS' 
      }),
      createMockAuction({ 
        id: 3, 
        title: '나이키 운동화', 
        currentPrice: 150000, 
        category: 'FASHION' 
      }),
    ];

    it('키워드로 필터링해야 한다', () => {
      // Given
      const keyword = '아이폰';
      
      // When
      const filtered = filterAuctions(auctions, { keyword });
      
      // Then
      expect(filtered).toHaveLength(1);
      expect(filtered[0].title).toContain('아이폰');
    });

    it('카테고리로 필터링해야 한다', () => {
      // Given
      const category = 'ELECTRONICS';
      
      // When
      const filtered = filterAuctions(auctions, { category });
      
      // Then
      expect(filtered).toHaveLength(2);
      filtered.forEach(auction => {
        expect(auction.category).toBe('ELECTRONICS');
      });
    });

    it('가격 범위로 필터링해야 한다', () => {
      // Given
      const minPrice = 200000;
      const maxPrice = 700000;
      
      // When
      const filtered = filterAuctions(auctions, { minPrice, maxPrice });
      
      // Then
      expect(filtered).toHaveLength(1);
      expect(filtered[0].currentPrice).toBeGreaterThanOrEqual(minPrice);
      expect(filtered[0].currentPrice).toBeLessThanOrEqual(maxPrice);
    });

    it('복합 조건으로 필터링해야 한다', () => {
      // Given
      const criteria = {
        category: 'ELECTRONICS',
        minPrice: 700000,
      };
      
      // When
      const filtered = filterAuctions(auctions, criteria);
      
      // Then
      expect(filtered).toHaveLength(1);
      expect(filtered[0].category).toBe('ELECTRONICS');
      expect(filtered[0].currentPrice).toBeGreaterThanOrEqual(700000);
    });
  });

  describe('경매 정렬', () => {
    const auctions = [
      createMockAuction({ 
        id: 1, 
        currentPrice: 300000,
        createdAt: '2024-01-01T10:00:00',
        bidCount: 5,
        viewCount: 100,
        endAt: new Date(Date.now() + 7200000).toISOString(), // 2시간 후
      }),
      createMockAuction({ 
        id: 2, 
        currentPrice: 100000,
        createdAt: '2024-01-02T10:00:00',
        bidCount: 10,
        viewCount: 50,
        endAt: new Date(Date.now() + 3600000).toISOString(), // 1시간 후
      }),
      createMockAuction({ 
        id: 3, 
        currentPrice: 200000,
        createdAt: '2024-01-03T10:00:00',
        bidCount: 2,
        viewCount: 200,
        endAt: new Date(Date.now() + 10800000).toISOString(), // 3시간 후
      }),
    ];

    it('가격 오름차순으로 정렬해야 한다', () => {
      // Given - When
      const sorted = sortAuctions([...auctions], 'PRICE_ASC');
      
      // Then
      expect(sorted[0].currentPrice).toBe(100000);
      expect(sorted[1].currentPrice).toBe(200000);
      expect(sorted[2].currentPrice).toBe(300000);
    });

    it('가격 내림차순으로 정렬해야 한다', () => {
      // Given - When
      const sorted = sortAuctions([...auctions], 'PRICE_DESC');
      
      // Then
      expect(sorted[0].currentPrice).toBe(300000);
      expect(sorted[1].currentPrice).toBe(200000);
      expect(sorted[2].currentPrice).toBe(100000);
    });

    it('마감 임박순으로 정렬해야 한다', () => {
      // Given - When
      const sorted = sortAuctions([...auctions], 'ENDING_SOON');
      
      // Then
      // 마감이 가장 가까운 것부터 (1시간 후 -> 2시간 후 -> 3시간 후)
      expect(sorted[0].id).toBe(2);
      expect(sorted[1].id).toBe(1);
      expect(sorted[2].id).toBe(3);
    });

    it('입찰수 내림차순으로 정렬해야 한다', () => {
      // Given - When
      const sorted = sortAuctions([...auctions], 'BID_COUNT_DESC');
      
      // Then
      expect(sorted[0].bidCount).toBe(10);
      expect(sorted[1].bidCount).toBe(5);
      expect(sorted[2].bidCount).toBe(2);
    });

    it('조회수 내림차순으로 정렬해야 한다', () => {
      // Given - When
      const sorted = sortAuctions([...auctions], 'VIEW_COUNT_DESC');
      
      // Then
      expect(sorted[0].viewCount).toBe(200);
      expect(sorted[1].viewCount).toBe(100);
      expect(sorted[2].viewCount).toBe(50);
    });

    it('최신순으로 정렬해야 한다', () => {
      // Given - When
      const sorted = sortAuctions([...auctions], 'CREATED_DESC');
      
      // Then
      // 최신 날짜부터 (2024-01-03 -> 2024-01-02 -> 2024-01-01)
      expect(sorted[0].id).toBe(3);
      expect(sorted[1].id).toBe(2);
      expect(sorted[2].id).toBe(1);
    });
  });

  // === 3. 에러 처리 테스트 ===

  describe('에러 처리', () => {
    it('유효하지 않은 날짜 문자열을 처리해야 한다', () => {
      // Given
      const invalidDate = 'invalid-date';
      
      // When
      const timeLeft = calculateTimeRemaining(invalidDate);
      
      // Then
      expect(timeLeft.totalMs).toBe(0);
      expect(timeLeft.hours).toBe(0);
      expect(timeLeft.minutes).toBe(0);
      expect(timeLeft.seconds).toBe(0);
    });

    it('음수 시간을 올바르게 처리해야 한다', () => {
      // Given
      const negativeTime = -1000;
      
      // When
      const formatted = formatTimeLeft(negativeTime);
      
      // Then
      expect(formatted).toBe('종료됨');
    });

    it('빈 배열 정렬을 처리해야 한다', () => {
      // Given
      const emptyArray: AuctionItem[] = [];
      
      // When
      const sorted = sortAuctions(emptyArray, 'PRICE_ASC');
      
      // Then
      expect(sorted).toEqual([]);
    });

    it('빈 배열 필터링을 처리해야 한다', () => {
      // Given
      const emptyArray: AuctionItem[] = [];
      
      // When
      const filtered = filterAuctions(emptyArray, { keyword: '검색어' });
      
      // Then
      expect(filtered).toEqual([]);
    });
  });
});