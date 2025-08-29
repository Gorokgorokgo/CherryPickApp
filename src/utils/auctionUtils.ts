// 경매 관련 유틸리티 함수들

/**
 * 남은 시간(밀리초)을 사람이 읽기 쉬운 형식으로 변환
 * @param remainingTimeMs 남은 시간 (밀리초)
 * @returns "2시간 15분" 형식의 문자열
 */
export function formatTimeLeft(remainingTimeMs: number): string {
  if (remainingTimeMs <= 0) {
    return '경매 종료';
  }

  const totalMinutes = Math.floor(remainingTimeMs / (1000 * 60));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  const days = Math.floor(hours / 24);
  const remainingHours = hours % 24;

  if (days > 0) {
    if (remainingHours > 0) {
      return `${days}일 ${remainingHours}시간`;
    }
    return `${days}일`;
  }

  if (hours > 0) {
    if (minutes > 0) {
      return `${hours}시간 ${minutes}분`;
    }
    return `${hours}시간`;
  }

  return `${minutes}분`;
}

/**
 * 가격을 한국어 형식으로 포맷팅
 * @param price 가격
 * @returns "1,200,000원" 형식의 문자열
 */
export function formatPrice(price: number): string {
  return price.toLocaleString('ko-KR') + '원';
}

/**
 * 카테고리 영문 코드를 한국어로 변환
 * @param category 영문 카테고리 코드
 * @returns 한국어 카테고리명
 */
export function getCategoryLabel(category: string): string {
  const categoryMap: Record<string, string> = {
    ELECTRONICS: '전자제품',
    FASHION: '패션',
    HOME: '생활용품', 
    SPORTS: '스포츠',
    BOOKS: '도서',
    BEAUTY: '뷰티',
    AUTOMOTIVE: '자동차용품',
    ETC: '기타',
  };
  
  return categoryMap[category] || category;
}

/**
 * 지역 범위 코드를 한국어로 변환
 * @param regionScope 지역 범위 코드
 * @returns 한국어 지역 범위명
 */
export function getRegionScopeLabel(regionScope: string): string {
  const scopeMap: Record<string, string> = {
    NATIONAL: '전국',
    REGIONAL: '지역',
  };
  
  return scopeMap[regionScope] || regionScope;
}