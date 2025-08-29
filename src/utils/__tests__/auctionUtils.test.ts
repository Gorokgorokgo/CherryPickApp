import { formatTimeLeft, formatPrice, getCategoryLabel, getRegionScopeLabel } from '../auctionUtils';

describe('AuctionUtils', () => {
  describe('formatTimeLeft', () => {
    it('경매 종료된 경우 "경매 종료"를 반환해야 한다', () => {
      // Given
      const expiredTime = 0;

      // When
      const result = formatTimeLeft(expiredTime);

      // Then
      expect(result).toBe('경매 종료');
    });

    it('음수 시간도 "경매 종료"를 반환해야 한다', () => {
      // Given
      const negativeTime = -1000;

      // When
      const result = formatTimeLeft(negativeTime);

      // Then
      expect(result).toBe('경매 종료');
    });

    it('일 단위 시간을 올바르게 포맷팅해야 한다', () => {
      // Given
      const oneDayMs = 24 * 60 * 60 * 1000;
      const oneDayAndHourMs = oneDayMs + (2 * 60 * 60 * 1000);

      // When
      const resultDay = formatTimeLeft(oneDayMs);
      const resultDayHour = formatTimeLeft(oneDayAndHourMs);

      // Then
      expect(resultDay).toBe('1일');
      expect(resultDayHour).toBe('1일 2시간');
    });

    it('시간과 분을 올바르게 포맷팅해야 한다', () => {
      // Given
      const twoHoursFifteenMinMs = (2 * 60 + 15) * 60 * 1000;
      const oneHourMs = 60 * 60 * 1000;

      // When
      const resultHourMin = formatTimeLeft(twoHoursFifteenMinMs);
      const resultHour = formatTimeLeft(oneHourMs);

      // Then
      expect(resultHourMin).toBe('2시간 15분');
      expect(resultHour).toBe('2시간');
    });

    it('분만 남은 경우를 올바르게 포맷팅해야 한다', () => {
      // Given
      const thirtyMinMs = 30 * 60 * 1000;

      // When
      const result = formatTimeLeft(thirtyMinMs);

      // Then
      expect(result).toBe('30분');
    });
  });

  describe('formatPrice', () => {
    it('가격을 한국어 형식으로 포맷팅해야 한다', () => {
      // Given
      const prices = [1000, 100000, 1200000];

      // When & Then
      expect(formatPrice(prices[0])).toBe('1,000원');
      expect(formatPrice(prices[1])).toBe('100,000원');
      expect(formatPrice(prices[2])).toBe('1,200,000원');
    });

    it('0원도 올바르게 포맷팅해야 한다', () => {
      // Given
      const zeroPrice = 0;

      // When
      const result = formatPrice(zeroPrice);

      // Then
      expect(result).toBe('0원');
    });
  });

  describe('getCategoryLabel', () => {
    it('영문 카테고리를 한국어로 변환해야 한다', () => {
      // Given & When & Then
      expect(getCategoryLabel('ELECTRONICS')).toBe('전자제품');
      expect(getCategoryLabel('FASHION')).toBe('패션');
      expect(getCategoryLabel('HOME')).toBe('생활용품');
      expect(getCategoryLabel('SPORTS')).toBe('스포츠');
      expect(getCategoryLabel('BOOKS')).toBe('도서');
      expect(getCategoryLabel('ETC')).toBe('기타');
    });

    it('알 수 없는 카테고리는 원본을 반환해야 한다', () => {
      // Given
      const unknownCategory = 'UNKNOWN_CATEGORY';

      // When
      const result = getCategoryLabel(unknownCategory);

      // Then
      expect(result).toBe(unknownCategory);
    });
  });

  describe('getRegionScopeLabel', () => {
    it('지역 범위를 한국어로 변환해야 한다', () => {
      // Given & When & Then
      expect(getRegionScopeLabel('NATIONAL')).toBe('전국');
      expect(getRegionScopeLabel('REGIONAL')).toBe('지역');
    });

    it('알 수 없는 지역 범위는 원본을 반환해야 한다', () => {
      // Given
      const unknownScope = 'UNKNOWN_SCOPE';

      // When
      const result = getRegionScopeLabel(unknownScope);

      // Then
      expect(result).toBe(unknownScope);
    });
  });
});