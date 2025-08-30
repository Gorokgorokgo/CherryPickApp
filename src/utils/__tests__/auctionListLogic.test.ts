/**
 * TDD 가이드에 따른 핵심 비즈니스 로직 테스트
 * 
 * 우선순위 1: 비즈니스 로직 단위 테스트
 * - 데이터 가공, 계산, 상태 변화, API 데이터 처리
 * - UI나 외부 의존성으로부터 분리된 순수 함수 테스트
 * - 모킹 남용하지 않고 실제 로직만 테스트
 */

import {
  formatTimeLeft,
  formatAuctionPrice,
  calculateTimeRemaining,
  formatBidCount,
} from '../auctionListUtils';

describe('경매 목록 핵심 비즈니스 로직', () => {
  
  describe('시간 계산 및 표시', () => {
    it('남은 시간을 정확히 계산해야 한다', () => {
      // Given
      const futureTime = new Date(Date.now() + 3661000).toISOString(); // 1시간 1분 1초 후
      
      // When
      const result = calculateTimeRemaining(futureTime);
      
      // Then
      expect(result.hours).toBe(1);
      expect(result.minutes).toBe(1);
      expect(result.seconds).toBeGreaterThanOrEqual(0);
      expect(result.seconds).toBeLessThanOrEqual(1);
      expect(result.totalMs).toBeGreaterThan(3660000);
    });

    it('과거 시간일 때 0을 반환해야 한다', () => {
      // Given
      const pastTime = new Date(Date.now() - 1000).toISOString();
      
      // When
      const result = calculateTimeRemaining(pastTime);
      
      // Then
      expect(result.totalMs).toBe(0);
      expect(result.hours).toBe(0);
      expect(result.minutes).toBe(0);
      expect(result.seconds).toBe(0);
    });

    it('남은 시간을 한국어로 표시해야 한다', () => {
      // Given - When - Then
      expect(formatTimeLeft(3661000)).toBe('1시간 1분 1초');
      expect(formatTimeLeft(3600000)).toBe('1시간 0분 0초'); // 정확히 1시간
      expect(formatTimeLeft(61000)).toBe('1분 1초');
      expect(formatTimeLeft(60000)).toBe('1분 0초'); // 정확히 1분
      expect(formatTimeLeft(5000)).toBe('5초');
      expect(formatTimeLeft(1000)).toBe('1초');
      expect(formatTimeLeft(500)).toBe('0초'); // 0초도 표시
      expect(formatTimeLeft(0)).toBe('0초'); // 0밀리초도 0초로 표시
      expect(formatTimeLeft(-1000)).toBe('종료됨'); // 음수일 때만 종료됨
    });

    it('잘못된 날짜 문자열을 처리해야 한다', () => {
      // Given
      const invalidDate = 'invalid-date-string';
      
      // When
      const result = calculateTimeRemaining(invalidDate);
      
      // Then
      expect(result.totalMs).toBe(0);
      expect(result.hours).toBe(0);
      expect(result.minutes).toBe(0);
      expect(result.seconds).toBe(0);
    });
  });

  describe('가격 포맷팅', () => {
    it('숫자를 한국 화폐 형식으로 변환해야 한다', () => {
      // Given - When - Then
      expect(formatAuctionPrice(1000)).toBe('1,000원');
      expect(formatAuctionPrice(1500000)).toBe('1,500,000원');
      expect(formatAuctionPrice(999)).toBe('999원');
      expect(formatAuctionPrice(0)).toBe('0원');
    });

    it('입찰 횟수를 한국어로 표시해야 한다', () => {
      // Given - When - Then
      expect(formatBidCount(0)).toBe('입찰 없음');
      expect(formatBidCount(1)).toBe('1회 입찰');
      expect(formatBidCount(5)).toBe('5회 입찰');
      expect(formatBidCount(100)).toBe('100회 입찰');
    });
  });

  describe('실제 사용 시나리오', () => {
    it('경매 마감 10분 전 상황을 정확히 처리해야 한다', () => {
      // Given - 실제 경매 마감 10분 전 상황
      const tenMinutesLater = new Date(Date.now() + 600000).toISOString();
      
      // When
      const timeLeft = calculateTimeRemaining(tenMinutesLater);
      const formattedTime = formatTimeLeft(timeLeft.totalMs);
      
      // Then
      expect(timeLeft.minutes).toBe(10);
      expect(formattedTime).toBe('10분 0초');
    });

    it('경매가 방금 종료된 상황을 처리해야 한다', () => {
      // Given - 방금 종료된 경매
      const justEnded = new Date(Date.now() - 1000).toISOString();
      
      // When
      const timeLeft = calculateTimeRemaining(justEnded);
      const formattedTime = formatTimeLeft(timeLeft.totalMs);
      
      // Then
      expect(timeLeft.totalMs).toBe(0);
      expect(formattedTime).toBe('0초'); // 0일 때는 0초 표시
    });

    it('고가 경매 가격을 정확히 표시해야 한다', () => {
      // Given - 1억원 경매
      const highPrice = 100000000;
      
      // When
      const formatted = formatAuctionPrice(highPrice);
      
      // Then
      expect(formatted).toBe('100,000,000원');
    });

    it('인기 경매의 입찰 수를 표시해야 한다', () => {
      // Given - 인기 경매 (50회 입찰)
      const popularAuction = 50;
      
      // When
      const formatted = formatBidCount(popularAuction);
      
      // Then
      expect(formatted).toBe('50회 입찰');
    });
  });

  describe('경계값 테스트', () => {
    it('1초 남은 경매를 정확히 처리해야 한다', () => {
      // Given
      const oneSecondLeft = new Date(Date.now() + 1000).toISOString();
      
      // When
      const timeLeft = calculateTimeRemaining(oneSecondLeft);
      const formatted = formatTimeLeft(timeLeft.totalMs);
      
      // Then
      expect(timeLeft.seconds).toBeGreaterThanOrEqual(0);
      expect(timeLeft.seconds).toBeLessThanOrEqual(1);
      expect(formatted).toMatch(/^[01]초$/);
    });

    it('정확히 1시간 남은 경매를 처리해야 한다', () => {
      // Given
      const oneHourLeft = new Date(Date.now() + 3600000).toISOString();
      
      // When
      const timeLeft = calculateTimeRemaining(oneHourLeft);
      const formatted = formatTimeLeft(timeLeft.totalMs);
      
      // Then
      expect(timeLeft.hours).toBe(1);
      expect(timeLeft.minutes).toBe(0);
      expect(formatted).toBe('1시간 0분 0초');
    });

    it('매우 큰 숫자 가격을 처리해야 한다', () => {
      // Given - JavaScript 최대 안전 정수에 가까운 값
      const maxPrice = 999999999999999;
      
      // When
      const formatted = formatAuctionPrice(maxPrice);
      
      // Then
      expect(formatted).toBe('999,999,999,999,999원');
    });
  });

  describe('데이터 무결성 테스트', () => {
    it('음수 가격을 처리해야 한다', () => {
      // Given
      const negativePrice = -1000;
      
      // When
      const formatted = formatAuctionPrice(negativePrice);
      
      // Then
      expect(formatted).toBe('-1,000원');
    });

    it('음수 입찰 수를 처리해야 한다', () => {
      // Given
      const negativeBids = -5;
      
      // When
      const formatted = formatBidCount(negativeBids);
      
      // Then
      expect(formatted).toBe('-5회 입찰');
    });

    it('소수점이 있는 시간을 올바르게 처리해야 한다', () => {
      // Given
      const timeWithDecimal = 1500.7; // 1.5초
      
      // When
      const formatted = formatTimeLeft(timeWithDecimal);
      
      // Then
      expect(formatted).toBe('1초'); // 소수점은 버림 처리
    });
  });
});