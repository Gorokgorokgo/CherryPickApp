/**
 * 간단한 AuctionListScreen 테스트 - 기본 기능만 확인
 */

import React from 'react';
import { render, waitFor, act } from '@testing-library/react-native';
import AuctionListScreen from '../AuctionListScreen';
import { apiService } from '../../../services/api';

// Mock dependencies
jest.mock('../../../services/api');

const mockNavigate = jest.fn();
const mockUseFocusEffect = jest.fn();

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    navigate: mockNavigate,
    setOptions: jest.fn(),
  }),
  useRoute: () => ({
    params: {},
  }),
  useFocusEffect: mockUseFocusEffect,
}));

const mockApiService = apiService as jest.Mocked<typeof apiService>;

// 간단한 더미 데이터
const mockAuctionData = {
  content: [
    {
      id: 1,
      title: '아이폰 14 Pro',
      description: '깨끗한 상태',
      category: 'ELECTRONICS',
      startPrice: 800000,
      currentPrice: 900000,
      hopePrice: 1200000,
      auctionTimeHours: 24,
      regionScope: 'NATIONWIDE',
      regionCode: '',
      regionName: '전국',
      status: 'ACTIVE',
      viewCount: 50,
      bidCount: 5,
      startAt: '2024-01-01T10:00:00',
      endAt: new Date(Date.now() + 3600000).toISOString(),
      createdAt: '2024-01-01T09:00:00',
      sellerId: 1,
      sellerNickname: '판매자1',
      imageUrls: ['image1.jpg'],
      remainingTimeMs: 3600000,
      isExpired: false,
    },
  ],
  totalElements: 1,
  totalPages: 1,
  first: true,
  last: true,
  size: 20,
  number: 0,
  numberOfElements: 1,
  empty: false,
  pageable: {
    pageNumber: 0,
    pageSize: 20,
    sort: { sorted: false, unsorted: true, empty: true },
    offset: 0,
    paged: true,
    unpaged: false,
  },
};

describe('AuctionListScreen - 간단한 테스트', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    mockUseFocusEffect.mockImplementation(() => {});
    
    mockApiService.getAuctions.mockResolvedValue({
      data: mockAuctionData,
      success: true,
      message: '성공',
    });
  });

  it('컴포넌트가 렌더링되어야 한다', () => {
    const { getByText } = render(<AuctionListScreen />);
    expect(getByText('경매 목록')).toBeTruthy();
  });

  it('검색 입력창이 있어야 한다', () => {
    const { getByPlaceholderText } = render(<AuctionListScreen />);
    expect(getByPlaceholderText('상품명, 브랜드를 검색하세요')).toBeTruthy();
  });

  it('로딩 인디케이터가 있어야 한다', () => {
    const { getByTestId } = render(<AuctionListScreen />);
    expect(getByTestId('auction-list-loading')).toBeTruthy();
  });

  it('초기 로드시 API를 호출해야 한다', async () => {
    await act(async () => {
      render(<AuctionListScreen />);
    });

    await waitFor(() => {
      expect(mockApiService.getAuctions).toHaveBeenCalledWith(0, 20);
    }, { timeout: 3000 });
  });
});