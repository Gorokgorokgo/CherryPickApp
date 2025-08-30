/**
 * TDD 가이드에 따른 경매 상세 화면 비즈니스 로직 테스트
 * 
 * 우선순위 1: 비즈니스 로직 단위 테스트
 * - 데이터 변환, 상태 계산, 입찰 검증 로직 테스트
 * - UI나 외부 의존성으로부터 분리된 순수 함수 테스트
 * - 모킹 남용하지 않고 실제 로직만 테스트
 */

import {
  validateBidAmount,
  formatSellerRating,
  calculateBidIncrement,
  transformAuctionDetailForDisplay,
  validateQuestionText,
} from '../auctionDetailUtils';

describe('경매 상세 화면 핵심 비즈니스 로직', () => {
  
  describe('입찰 금액 검증', () => {
    it('입찰 금액이 현재가보다 높아야 한다', () => {
      // Given
      const currentPrice = 500000;
      const minimumIncrement = 10000;
      const bidAmount = 520000;
      
      // When
      const result = validateBidAmount(bidAmount, currentPrice, minimumIncrement);
      
      // Then
      expect(result.isValid).toBe(true);
      expect(result.error).toBeNull();
    });

    it('입찰 금액이 현재가보다 낮으면 검증 실패', () => {
      // Given
      const currentPrice = 500000;
      const minimumIncrement = 10000;
      const bidAmount = 480000;
      
      // When
      const result = validateBidAmount(bidAmount, currentPrice, minimumIncrement);
      
      // Then
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('현재 입찰가보다 높은 금액을 입력해주세요.');
    });

    it('최소 입찰 증가액보다 낮으면 검증 실패', () => {
      // Given
      const currentPrice = 500000;
      const minimumIncrement = 10000;
      const bidAmount = 505000; // 증가액이 5000원으로 부족
      
      // When
      const result = validateBidAmount(bidAmount, currentPrice, minimumIncrement);
      
      // Then
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('최소 510,000원 이상 입찰해주세요.');
    });

    it('음수 금액은 검증 실패', () => {
      // Given
      const currentPrice = 500000;
      const minimumIncrement = 10000;
      const bidAmount = -100000;
      
      // When
      const result = validateBidAmount(bidAmount, currentPrice, minimumIncrement);
      
      // Then
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('유효한 금액을 입력해주세요.');
    });

    it('0원은 검증 실패', () => {
      // Given
      const currentPrice = 500000;
      const minimumIncrement = 10000;
      const bidAmount = 0;
      
      // When
      const result = validateBidAmount(bidAmount, currentPrice, minimumIncrement);
      
      // Then
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('유효한 금액을 입력해주세요.');
    });
  });

  describe('판매자 평점 포맷팅', () => {
    it('평점을 소수점 1자리로 표시해야 한다', () => {
      // Given - When - Then
      expect(formatSellerRating(4.8)).toBe('4.8');
      expect(formatSellerRating(4.85)).toBe('4.9');
      expect(formatSellerRating(4.0)).toBe('4.0');
      expect(formatSellerRating(5.0)).toBe('5.0');
    });

    it('평점이 0보다 작으면 0.0으로 표시', () => {
      // Given - When - Then
      expect(formatSellerRating(-1.5)).toBe('0.0');
      expect(formatSellerRating(0)).toBe('0.0');
    });

    it('평점이 5보다 크면 5.0으로 표시', () => {
      // Given - When - Then
      expect(formatSellerRating(6.5)).toBe('5.0');
      expect(formatSellerRating(10.0)).toBe('5.0');
    });
  });

  describe('입찰 증가액 계산 (5% 고정 + 100원 단위)', () => {
    it('현재가의 5%로 최소 증가액을 계산해야 한다', () => {
      // Given - When - Then
      expect(calculateBidIncrement(10000)).toBe(500);    // 10,000 * 5% = 500원
      expect(calculateBidIncrement(50000)).toBe(2500);   // 50,000 * 5% = 2,500원
      expect(calculateBidIncrement(100000)).toBe(5000);  // 100,000 * 5% = 5,000원
      expect(calculateBidIncrement(500000)).toBe(25000); // 500,000 * 5% = 25,000원
      expect(calculateBidIncrement(1000000)).toBe(50000); // 1,000,000 * 5% = 50,000원
    });

    it('100원 단위로 올림 처리해야 한다', () => {
      // Given - When - Then
      expect(calculateBidIncrement(1234)).toBe(100);  // 1,234 * 5% = 61.7 → 100원
      expect(calculateBidIncrement(3333)).toBe(200);  // 3,333 * 5% = 166.65 → 200원
      expect(calculateBidIncrement(7777)).toBe(400);  // 7,777 * 5% = 388.85 → 400원
    });

    it('음수나 0원에 대해서는 기본 증가액 반환', () => {
      // Given - When - Then
      expect(calculateBidIncrement(-100000)).toBe(100);
      expect(calculateBidIncrement(0)).toBe(100);
    });
  });

  describe('질문 텍스트 검증', () => {
    it('유효한 질문 텍스트는 검증 통과', () => {
      // Given
      const validQuestion = '상품 상태가 궁금합니다.';
      
      // When
      const result = validateQuestionText(validQuestion);
      
      // Then
      expect(result.isValid).toBe(true);
      expect(result.error).toBeNull();
    });

    it('빈 문자열은 검증 실패', () => {
      // Given
      const emptyQuestion = '';
      
      // When
      const result = validateQuestionText(emptyQuestion);
      
      // Then
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('질문을 입력해주세요.');
    });

    it('공백만 있는 문자열은 검증 실패', () => {
      // Given
      const whitespaceQuestion = '   ';
      
      // When
      const result = validateQuestionText(whitespaceQuestion);
      
      // Then
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('질문을 입력해주세요.');
    });

    it('너무 긴 질문은 검증 실패', () => {
      // Given
      const longQuestion = 'A'.repeat(1001); // 1000자 초과
      
      // When
      const result = validateQuestionText(longQuestion);
      
      // Then
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('질문은 1000자 이하로 입력해주세요.');
    });

    it('1000자 정확히는 검증 통과', () => {
      // Given
      const exactLimitQuestion = 'A'.repeat(1000);
      
      // When
      const result = validateQuestionText(exactLimitQuestion);
      
      // Then
      expect(result.isValid).toBe(true);
      expect(result.error).toBeNull();
    });
  });

  describe('경매 데이터 변환', () => {
    it('API 데이터를 화면 표시용으로 올바르게 변환해야 한다', () => {
      // Given - API에서 받은 경매 데이터
      const apiData = {
        id: 1,
        title: '아이폰 14 Pro',
        description: '깨끗한 상태',
        currentPrice: 850000,
        startPrice: 500000,
        hopePrice: 1200000,
        bidCount: 5,
        sellerNickname: '홍길동',
        endAt: new Date(Date.now() + 3600000).toISOString(), // 1시간 후
        category: 'ELECTRONICS',
        regionName: '서울 강남구',
        imageUrls: ['image1.jpg', 'image2.jpg'],
        viewCount: 50,
      };
      
      // When
      const result = transformAuctionDetailForDisplay(apiData);
      
      // Then
      expect(result.formattedCurrentPrice).toBe('850,000원');
      expect(result.formattedStartPrice).toBe('500,000원');
      expect(result.formattedHopePrice).toBe('1,200,000원');
      expect(result.timeLeftText).toMatch(/(시간|분|초)/);
      expect(result.minimumBidIncrement).toBe(42500); // 850,000 * 5% = 42,500원
      expect(result.hasImages).toBe(true);
      expect(result.imageCount).toBe(2);
    });

    it('이미지가 없는 경우를 올바르게 처리해야 한다', () => {
      // Given
      const apiDataWithoutImages = {
        id: 1,
        title: '상품',
        currentPrice: 100000,
        imageUrls: [],
        endAt: new Date(Date.now() + 3600000).toISOString(),
      };
      
      // When
      const result = transformAuctionDetailForDisplay(apiDataWithoutImages);
      
      // Then
      expect(result.hasImages).toBe(false);
      expect(result.imageCount).toBe(0);
    });

    it('만료된 경매를 올바르게 처리해야 한다', () => {
      // Given
      const expiredApiData = {
        id: 1,
        title: '만료된 상품',
        currentPrice: 100000,
        endAt: new Date(Date.now() - 3600000).toISOString(), // 1시간 전
        imageUrls: [],
      };
      
      // When
      const result = transformAuctionDetailForDisplay(expiredApiData);
      
      // Then
      expect(result.timeLeftText).toBe('종료됨');
      expect(result.isExpired).toBe(true);
    });
  });

  describe('실제 사용 시나리오', () => {
    it('사용자가 정상적인 입찰을 시도하는 경우', () => {
      // Given - 현재 85만원 경매에 90만원 입찰
      const currentPrice = 850000;
      const minimumIncrement = calculateBidIncrement(currentPrice);
      const userBidAmount = 900000;
      
      // When
      const validation = validateBidAmount(userBidAmount, currentPrice, minimumIncrement);
      
      // Then
      expect(validation.isValid).toBe(true);
      expect(minimumIncrement).toBe(42500); // 850,000 * 5% = 42,500원
    });

    it('사용자가 부족한 금액으로 입찰을 시도하는 경우', () => {
      // Given - 현재 85만원 경매에 87만원 입찰 (2만원 증가, 부족)
      const currentPrice = 850000;
      const minimumIncrement = calculateBidIncrement(currentPrice); // 42,500원
      const userBidAmount = 870000; // 2만원 증가, 부족
      
      // When
      const validation = validateBidAmount(userBidAmount, currentPrice, minimumIncrement);
      
      // Then
      expect(validation.isValid).toBe(false);
      expect(validation.error).toBe('최소 892,500원 이상 입찰해주세요.'); // 850,000 + 42,500
    });

    it('판매자 정보를 올바르게 표시하는 경우', () => {
      // Given
      const sellerRating = 4.87;
      
      // When
      const formatted = formatSellerRating(sellerRating);
      
      // Then
      expect(formatted).toBe('4.9');
    });
  });

  describe('경계값 테스트', () => {
    it('5% 계산에서 경계값이 정확히 작동해야 한다', () => {
      // Given - When - Then
      expect(calculateBidIncrement(1999)).toBe(100);   // 1,999 * 5% = 99.95 → 100원
      expect(calculateBidIncrement(2000)).toBe(100);   // 2,000 * 5% = 100원
      expect(calculateBidIncrement(2001)).toBe(200);   // 2,001 * 5% = 100.05 → 200원
      expect(calculateBidIncrement(19999)).toBe(1000); // 19,999 * 5% = 999.95 → 1,000원
      expect(calculateBidIncrement(20000)).toBe(1000); // 20,000 * 5% = 1,000원
    });

    it('질문 길이 경계값에서 정확히 작동해야 한다', () => {
      // Given - When - Then
      expect(validateQuestionText('A'.repeat(999)).isValid).toBe(true);  // 999자
      expect(validateQuestionText('A'.repeat(1000)).isValid).toBe(true); // 1000자
      expect(validateQuestionText('A'.repeat(1001)).isValid).toBe(false); // 1001자
    });
  });
});