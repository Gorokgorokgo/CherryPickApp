/**
 * 숫자를 원화 형식으로 포맷합니다.
 * @param amount - 포맷할 금액
 * @returns 쉼표가 포함된 금액 문자열
 */
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('ko-KR').format(amount);
};

/**
 * 날짜를 한국어 형식으로 포맷합니다.
 * @param date - 포맷할 날짜
 * @param options - 포맷 옵션
 * @returns 포맷된 날짜 문자열
 */
export const formatDate = (
  date: Date,
  options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }
): string => {
  return date.toLocaleDateString('ko-KR', options);
};

/**
 * 상대적 시간을 포맷합니다 (예: "2시간 전", "3일 전")
 * @param date - 비교할 날짜
 * @returns 상대적 시간 문자열
 */
export const formatRelativeTime = (date: Date): string => {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  const intervals = [
    { label: '년', seconds: 31536000 },
    { label: '개월', seconds: 2592000 },
    { label: '일', seconds: 86400 },
    { label: '시간', seconds: 3600 },
    { label: '분', seconds: 60 },
  ];

  for (const interval of intervals) {
    const count = Math.floor(diffInSeconds / interval.seconds);
    if (count >= 1) {
      return `${count}${interval.label} 전`;
    }
  }

  return '방금 전';
};

/**
 * 경매 남은 시간을 포맷합니다.
 * @param endDate - 경매 종료 시간
 * @returns 남은 시간 문자열
 */
export const formatTimeRemaining = (endDate: Date): string => {
  const now = new Date();
  const diffInSeconds = Math.floor((endDate.getTime() - now.getTime()) / 1000);

  if (diffInSeconds <= 0) {
    return '경매 종료';
  }

  const days = Math.floor(diffInSeconds / 86400);
  const hours = Math.floor((diffInSeconds % 86400) / 3600);
  const minutes = Math.floor((diffInSeconds % 3600) / 60);

  if (days > 0) {
    return `${days}일 ${hours}시간`;
  } else if (hours > 0) {
    return `${hours}시간 ${minutes}분`;
  } else {
    return `${minutes}분`;
  }
};

/**
 * 파일 크기를 포맷합니다.
 * @param bytes - 파일 크기(바이트)
 * @returns 포맷된 파일 크기 문자열
 */
export const formatFileSize = (bytes: number): string => {
  const sizes = ['B', 'KB', 'MB', 'GB'];
  if (bytes === 0) return '0 B';
  
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  const size = bytes / Math.pow(1024, i);
  
  return `${size.toFixed(1)} ${sizes[i]}`;
};

/**
 * 전화번호를 포맷합니다.
 * @param phoneNumber - 전화번호
 * @returns 포맷된 전화번호 문자열
 */
export const formatPhoneNumber = (phoneNumber: string): string => {
  const cleaned = phoneNumber.replace(/\D/g, '');
  
  if (cleaned.length === 11) {
    return cleaned.replace(/(\d{3})(\d{4})(\d{4})/, '$1-$2-$3');
  } else if (cleaned.length === 10) {
    return cleaned.replace(/(\d{3})(\d{3})(\d{4})/, '$1-$2-$3');
  }
  
  return phoneNumber;
};

/**
 * 카드번호를 마스킹하여 포맷합니다.
 * @param cardNumber - 카드번호
 * @returns 마스킹된 카드번호 문자열
 */
export const formatCardNumber = (cardNumber: string): string => {
  const cleaned = cardNumber.replace(/\D/g, '');
  if (cleaned.length >= 4) {
    const lastFour = cleaned.slice(-4);
    return `**** **** **** ${lastFour}`;
  }
  return cardNumber;
};

/**
 * 계좌번호를 마스킹하여 포맷합니다.
 * @param accountNumber - 계좌번호
 * @returns 마스킹된 계좌번호 문자열
 */
export const formatAccountNumber = (accountNumber: string): string => {
  const cleaned = accountNumber.replace(/[^0-9-]/g, '');
  if (cleaned.length >= 4) {
    const lastFour = cleaned.slice(-4);
    const prefix = cleaned.slice(0, -4).replace(/./g, '*');
    return `${prefix}${lastFour}`;
  }
  return accountNumber;
};