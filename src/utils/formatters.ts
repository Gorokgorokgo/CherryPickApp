/**
 * 공통 포맷팅 유틸리티 함수들
 */

// 가격 포맷팅
export const formatPrice = (price: number): string => {
  return price.toLocaleString('ko-KR') + '원';
};

// 시간 포맷팅 (경매 남은 시간)
export const formatTimeLeft = (endTime: string): string => {
  const now = new Date();
  const end = new Date(endTime);
  const diff = end.getTime() - now.getTime();

  if (diff <= 0) return '종료';

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  if (days > 0) return `${days}일 ${hours}시간`;
  if (hours > 0) return `${hours}시간 ${minutes}분`;
  return `${minutes}분`;
};

// 날짜 포맷팅
export const formatDate = (date: string | Date): string => {
  const targetDate = typeof date === 'string' ? new Date(date) : date;
  return targetDate.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

// 전화번호 포맷팅
export const formatPhoneNumber = (phone: string): string => {
  const cleaned = phone.replace(/\D/g, '');
  const match = cleaned.match(/^(\d{3})(\d{4})(\d{4})$/);
  if (match) {
    return `${match[1]}-${match[2]}-${match[3]}`;
  }
  return phone;
};

// 카테고리 한글명 매핑
export const getCategoryDisplayName = (category: string): string => {
  const categoryMap: Record<string, string> = {
    electronics: '전자제품',
    fashion: '패션',
    home: '생활용품',
    sports: '스포츠',
    books: '도서',
    beauty: '뷰티',
    automotive: '자동차용품',
    etc: '기타',
  };
  
  return categoryMap[category] || category;
};

// 상품 상태 한글명 매핑
export const getConditionDisplayName = (condition: string): string => {
  const conditionMap: Record<string, string> = {
    new: '새상품',
    'like-new': '거의 새것',
    good: '좋음',
    fair: '보통',
    poor: '나쁨',
  };
  
  return conditionMap[condition] || condition;
};