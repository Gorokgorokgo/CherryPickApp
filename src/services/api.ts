import { API_ENDPOINTS } from '../constants';

interface ApiResponse<T> {
  data: T;
  message: string;
  success: boolean;
}

interface AuthResponse {
  token: string;
  user: {
    id: number;
    email: string;
    nickname: string;
  };
}

interface SignUpRequest {
  phoneNumber: string;
  verificationCode: string;
  email: string;
  nickname: string;
  password: string;
  agreeToTerms: boolean;
  agreeToPrivacy: boolean;
}

interface LoginRequest {
  email: string;
  password: string;
}

// 경매 관련 타입 정의
interface AuctionItem {
  id: number;
  title: string;
  description: string;
  category: string;
  startPrice: number;
  currentPrice: number;
  hopePrice: number;
  auctionTimeHours: number;
  regionScope: string;
  regionCode: string;
  regionName: string;
  status: string;
  viewCount: number;
  bidCount: number;
  startAt: string;
  endAt: string;
  createdAt: string;
  sellerId: number;
  sellerNickname: string;
  imageUrls: string[];
  remainingTimeMs: number;
  isExpired: boolean;
}

interface AuctionListResponse {
  content: AuctionItem[];
  pageable: {
    pageNumber: number;
    pageSize: number;
    sort: {
      sorted: boolean;
      unsorted: boolean;
      empty: boolean;
    };
    offset: number;
    paged: boolean;
    unpaged: boolean;
  };
  totalPages: number;
  totalElements: number;
  last: boolean;
  first: boolean;
  size: number;
  number: number;
  numberOfElements: number;
  empty: boolean;
}

interface AuctionDetailResponse extends AuctionItem {
  // 상세 정보에만 포함되는 추가 필드가 있다면 여기 추가
}

class ApiService {
  private baseUrl: string;
  private token: string | null = null;

  constructor() {
    this.baseUrl = API_ENDPOINTS.BASE_URL;
  }

  setToken(token: string) {
    this.token = token;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`;
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    console.log('API Request:', {
      url,
      method: options.method || 'GET',
      headers,
      body: options.body,
    });

    try {
      const response = await fetch(url, {
        ...options,
        headers,
        timeout: 10000,
      });

      console.log('API Response Status:', response.status);
      
      const data = await response.json();
      console.log('API Response Data:', data);

      if (!response.ok) {
        throw new Error(data.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      return {
        data,
        message: data.message || 'Success',
        success: true,
      };
    } catch (error: any) {
      console.error('API Request Error:', {
        url,
        error: error.message,
        stack: error.stack,
      });
      
      if (error.name === 'AbortError' || error.message.includes('timeout')) {
        throw new Error('요청 시간이 초과되었습니다. 네트워크 연결을 확인해주세요.');
      }
      
      if (error.message.includes('Network request failed')) {
        throw new Error('네트워크 연결을 확인해주세요.\n백엔드 서버가 실행 중인지 확인하세요.');
      }
      
      throw error;
    }
  }

  // 인증 API
  async sendVerificationCode(phoneNumber: string): Promise<ApiResponse<any>> {
    return this.request('/auth/send-code', {
      method: 'POST',
      body: JSON.stringify({ phoneNumber }),
    });
  }

  async verifyCode(phoneNumber: string, code: string): Promise<ApiResponse<any>> {
    return this.request('/auth/verify-code', {
      method: 'POST',
      body: JSON.stringify({ 
        phoneNumber, 
        verificationCode: code 
      }),
    });
  }

  async signUp(data: SignUpRequest): Promise<ApiResponse<AuthResponse>> {
    return this.request('/auth/signup', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async login(data: LoginRequest): Promise<ApiResponse<AuthResponse>> {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // 경매 API
  async getAuctions(page: number = 0, size: number = 20): Promise<ApiResponse<AuctionListResponse>> {
    return this.request(`/auctions?page=${page}&size=${size}`);
  }

  async getAuctionsByCategory(category: string, page: number = 0, size: number = 20): Promise<ApiResponse<AuctionListResponse>> {
    return this.request(`/auctions/category/${category}?page=${page}&size=${size}`);
  }

  async getAuctionsByRegion(regionScope: string, regionCode?: string, page: number = 0, size: number = 20): Promise<ApiResponse<AuctionListResponse>> {
    const params = new URLSearchParams({
      regionScope,
      page: page.toString(),
      size: size.toString(),
    });
    if (regionCode) params.append('regionCode', regionCode);
    return this.request(`/auctions/region?${params}`);
  }

  async getAuctionDetail(auctionId: number): Promise<ApiResponse<AuctionDetailResponse>> {
    return this.request(`/auctions/${auctionId}`);
  }

  async getMyAuctions(page: number = 0, size: number = 20): Promise<ApiResponse<AuctionListResponse>> {
    return this.request(`/auctions/my?page=${page}&size=${size}`);
  }

  // 사용자 API
  async getUserProfile(): Promise<ApiResponse<any>> {
    return this.request('/users/profile');
  }

  async updateProfile(data: any): Promise<ApiResponse<any>> {
    return this.request('/users/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // 포인트 API
  async getPointBalance(): Promise<ApiResponse<any>> {
    return this.request('/points/balance');
  }

  async chargePoints(data: any): Promise<ApiResponse<any>> {
    return this.request('/points/charge', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }
}

export const apiService = new ApiService();
export default apiService;

// 타입도 export
export type { AuctionItem, AuctionListResponse, AuctionDetailResponse };