/**
 * TDD: 경매 목록 화면 테스트
 * 
 * TDD 가이드에 따른 테스트 우선순위:
 * 1. 비즈니스 로직 단위 테스트 (이미 완료됨 - auctionListUtils)
 * 2. 사용자 인터랙션/동작 테스트 
 * 3. 주요 사용자 플로우 테스트
 */

import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import { Alert } from 'react-native';
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

// Mock Alert
jest.spyOn(Alert, 'alert').mockImplementation(() => {});

const mockApiService = apiService as jest.Mocked<typeof apiService>;

// 테스트용 더미 데이터
const mockAuctionData = {
  content: [
    {
      id: 1,
      title: '아이폰 14 Pro 256GB',
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
      endAt: new Date(Date.now() + 3600000).toISOString(), // 1시간 후
      createdAt: '2024-01-01T09:00:00',
      sellerId: 1,
      sellerNickname: '판매자1',
      imageUrls: ['image1.jpg'],
      remainingTimeMs: 3600000,
      isExpired: false,
    },
    {
      id: 2,
      title: '갤럭시 S23 Ultra',
      description: '거의 새것',
      category: 'ELECTRONICS',
      startPrice: 600000,
      currentPrice: 750000,
      hopePrice: 1000000,
      auctionTimeHours: 48,
      regionScope: 'CITY',
      regionCode: '11',
      regionName: '서울',
      status: 'ACTIVE',
      viewCount: 30,
      bidCount: 3,
      startAt: '2024-01-01T11:00:00',
      endAt: new Date(Date.now() + 7200000).toISOString(), // 2시간 후
      createdAt: '2024-01-01T10:00:00',
      sellerId: 2,
      sellerNickname: '판매자2',
      imageUrls: ['image2.jpg'],
      remainingTimeMs: 7200000,
      isExpired: false,
    },
  ],
  totalElements: 2,
  totalPages: 1,
  first: true,
  last: true,
  size: 20,
  number: 0,
  numberOfElements: 2,
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

describe('AuctionListScreen - TDD', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockNavigate.mockClear();
    
    // useFocusEffect mock 설정 - 콜백을 바로 실행하지 않도록
    mockUseFocusEffect.mockImplementation((callback) => {
      // 콜백을 저장하지만 바로 실행하지는 않음
    });
    
    // 기본 API 응답 설정
    mockApiService.getAuctions.mockResolvedValue({
      data: mockAuctionData,
      success: true,
      message: '성공',
    });
  });

  // === 2. 사용자 인터랙션/동작 테스트 ===
  
  describe('초기 화면 로딩', () => {
    it('화면이 로드될 때 경매 목록을 가져와야 한다', async () => {
      // Given - When
      await act(async () => {
        render(<AuctionListScreen />);
      });

      // Then
      await waitFor(() => {
        expect(mockApiService.getAuctions).toHaveBeenCalledWith(0, 20);
      });
    });

    it('로딩 중일 때 로딩 인디케이터를 보여야 한다', () => {
      // Given
      const { getByTestId } = render(<AuctionListScreen />);

      // When - Then
      expect(getByTestId('auction-list-loading')).toBeTruthy();
    });

    it('경매 목록이 로드된 후 경매 카드들을 보여야 한다', async () => {
      // Given
      const { getByText } = render(<AuctionListScreen />);

      // When - Then
      await waitFor(() => {
        expect(getByText('아이폰 14 Pro 256GB')).toBeTruthy();
        expect(getByText('갤럭시 S23 Ultra')).toBeTruthy();
      });
    });
  });

  describe('검색 기능', () => {
    it('검색어를 입력할 수 있어야 한다', async () => {
      // Given
      const { getByPlaceholderText } = render(<AuctionListScreen />);
      
      // 초기 로딩 완료 대기
      await waitFor(() => {
        expect(mockApiService.getAuctions).toHaveBeenCalled();
      });

      const searchInput = getByPlaceholderText('상품명, 브랜드를 검색하세요');

      // When
      fireEvent.changeText(searchInput, '아이폰');

      // Then
      expect(searchInput.props.value).toBe('아이폰');
    });

    it('검색 버튼을 누르면 검색 API를 호출해야 한다', async () => {
      // Given
      mockApiService.searchByKeyword.mockResolvedValue({
        data: { ...mockAuctionData, content: [mockAuctionData.content[0]] },
        success: true,
        message: '성공',
      });

      const { getByPlaceholderText, getByTestId } = render(<AuctionListScreen />);
      
      // 초기 로딩 완료 대기
      await waitFor(() => {
        expect(mockApiService.getAuctions).toHaveBeenCalled();
      });

      const searchInput = getByPlaceholderText('상품명, 브랜드를 검색하세요');
      const searchButton = getByTestId('search-button');

      // When
      fireEvent.changeText(searchInput, '아이폰');
      fireEvent.press(searchButton);

      // Then
      await waitFor(() => {
        expect(mockApiService.searchByKeyword).toHaveBeenCalledWith('아이폰', 'ACTIVE', 0, 20);
      });
    });

    it('검색어가 비어있으면 전체 목록을 다시 가져와야 한다', async () => {
      // Given
      const { getByPlaceholderText, getByTestId } = render(<AuctionListScreen />);
      
      await waitFor(() => {
        expect(mockApiService.getAuctions).toHaveBeenCalled();
      });

      const searchInput = getByPlaceholderText('상품명, 브랜드를 검색하세요');
      const searchButton = getByTestId('search-button');

      // When
      fireEvent.changeText(searchInput, '');
      fireEvent.press(searchButton);

      // Then
      await waitFor(() => {
        expect(mockApiService.getAuctions).toHaveBeenCalledTimes(2); // 초기 + 빈 검색
      });
    });
  });

  describe('필터 기능', () => {
    it('카테고리 필터를 선택할 수 있어야 한다', async () => {
      // Given
      const { getByTestId, getByText } = render(<AuctionListScreen />);
      
      await waitFor(() => {
        expect(mockApiService.getAuctions).toHaveBeenCalled();
      });

      // When
      const categoryFilter = getByTestId('category-filter-button');
      fireEvent.press(categoryFilter);

      // Then
      expect(getByText('전자제품')).toBeTruthy();
      expect(getByText('패션')).toBeTruthy();
    });

    it('카테고리를 선택하면 필터링된 결과를 가져와야 한다', async () => {
      // Given
      mockApiService.getAuctionsByCategory.mockResolvedValue({
        data: { ...mockAuctionData, content: [mockAuctionData.content[0]] },
        success: true,
        message: '성공',
      });

      const { getByTestId, getByText } = render(<AuctionListScreen />);
      
      await waitFor(() => {
        expect(mockApiService.getAuctions).toHaveBeenCalled();
      });

      // When
      const categoryFilter = getByTestId('category-filter-button');
      fireEvent.press(categoryFilter);
      
      const electronicsOption = getByText('전자제품');
      fireEvent.press(electronicsOption);

      // Then
      await waitFor(() => {
        expect(mockApiService.getAuctionsByCategory).toHaveBeenCalledWith('ELECTRONICS', 0, 20);
      });
    });

    it('가격 범위 필터를 설정할 수 있어야 한다', async () => {
      // Given
      mockApiService.searchByPriceRange.mockResolvedValue({
        data: mockAuctionData,
        success: true,
        message: '성공',
      });

      const { getByTestId, getByPlaceholderText } = render(<AuctionListScreen />);
      
      await waitFor(() => {
        expect(mockApiService.getAuctions).toHaveBeenCalled();
      });

      // When
      const priceFilter = getByTestId('price-filter-button');
      fireEvent.press(priceFilter);

      const minPriceInput = getByPlaceholderText('최소 가격');
      const maxPriceInput = getByPlaceholderText('최대 가격');
      const applyButton = getByTestId('price-filter-apply');

      fireEvent.changeText(minPriceInput, '500000');
      fireEvent.changeText(maxPriceInput, '1000000');
      fireEvent.press(applyButton);

      // Then
      await waitFor(() => {
        expect(mockApiService.searchByPriceRange).toHaveBeenCalledWith(500000, 1000000, 'ACTIVE', 0, 20);
      });
    });
  });

  describe('정렬 기능', () => {
    it('정렬 옵션을 선택할 수 있어야 한다', async () => {
      // Given
      const { getByTestId, getByText } = render(<AuctionListScreen />);
      
      await waitFor(() => {
        expect(mockApiService.getAuctions).toHaveBeenCalled();
      });

      // When
      const sortButton = getByTestId('sort-button');
      fireEvent.press(sortButton);

      // Then
      expect(getByText('최신순')).toBeTruthy();
      expect(getByText('낮은 가격순')).toBeTruthy();
      expect(getByText('높은 가격순')).toBeTruthy();
      expect(getByText('마감 임박순')).toBeTruthy();
    });

    it('가격순 정렬을 선택하면 정렬된 결과를 보여야 한다', async () => {
      // Given
      mockApiService.searchAuctions.mockResolvedValue({
        data: mockAuctionData,
        success: true,
        message: '성공',
      });

      const { getByTestId, getByText } = render(<AuctionListScreen />);
      
      await waitFor(() => {
        expect(mockApiService.getAuctions).toHaveBeenCalled();
      });

      // When
      const sortButton = getByTestId('sort-button');
      fireEvent.press(sortButton);
      
      const priceAscOption = getByText('낮은 가격순');
      fireEvent.press(priceAscOption);

      // Then
      await waitFor(() => {
        expect(mockApiService.searchAuctions).toHaveBeenCalledWith(
          { sortBy: 'PRICE_ASC' },
          0,
          20
        );
      });
    });
  });

  describe('경매 카드 상호작용', () => {
    it('경매 카드를 탭하면 상세 화면으로 이동해야 한다', async () => {
      // Given
      const { getByText } = render(<AuctionListScreen />);
      
      await waitFor(() => {
        expect(getByText('아이폰 14 Pro 256GB')).toBeTruthy();
      });

      // When
      const auctionCard = getByText('아이폰 14 Pro 256GB');
      fireEvent.press(auctionCard);

      // Then
      expect(mockNavigate).toHaveBeenCalledWith('AuctionDetail', { auctionId: 1 });
    });
  });

  describe('무한 스크롤', () => {
    it('목록 끝에 도달하면 다음 페이지를 로드해야 한다', async () => {
      // Given
      const { getByTestId } = render(<AuctionListScreen />);
      
      await waitFor(() => {
        expect(mockApiService.getAuctions).toHaveBeenCalledWith(0, 20);
      });

      // When
      const flatList = getByTestId('auction-list');
      fireEvent(flatList, 'onEndReached');

      // Then
      await waitFor(() => {
        expect(mockApiService.getAuctions).toHaveBeenCalledWith(1, 20);
      });
    });

    it('로딩 중일 때는 중복 요청을 하지 않아야 한다', async () => {
      // Given
      const { getByTestId } = render(<AuctionListScreen />);
      
      await waitFor(() => {
        expect(mockApiService.getAuctions).toHaveBeenCalledWith(0, 20);
      });

      const flatList = getByTestId('auction-list');

      // When - 빠르게 여러 번 스크롤
      fireEvent(flatList, 'onEndReached');
      fireEvent(flatList, 'onEndReached');
      fireEvent(flatList, 'onEndReached');

      // Then
      await waitFor(() => {
        expect(mockApiService.getAuctions).toHaveBeenCalledTimes(2); // 초기 + 한 번만 추가
      });
    });
  });

  describe('에러 처리', () => {
    it('네트워크 오류 시 에러 메시지를 보여야 한다', async () => {
      // Given
      mockApiService.getAuctions.mockRejectedValue(
        new Error('네트워크 연결을 확인해주세요.')
      );

      // When
      render(<AuctionListScreen />);

      // Then
      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalledWith(
          '오류',
          '네트워크 연결을 확인해주세요.'
        );
      });
    });

    it('빈 결과일 때 적절한 메시지를 보여야 한다', async () => {
      // Given
      mockApiService.getAuctions.mockResolvedValue({
        data: { ...mockAuctionData, content: [], totalElements: 0 },
        success: true,
        message: '성공',
      });

      // When
      const { getByText } = render(<AuctionListScreen />);

      // Then
      await waitFor(() => {
        expect(getByText('진행 중인 경매가 없습니다')).toBeTruthy();
      });
    });
  });

  describe('새로고침 기능', () => {
    it('Pull to Refresh로 목록을 새로고침할 수 있어야 한다', async () => {
      // Given
      const { getByTestId } = render(<AuctionListScreen />);
      
      await waitFor(() => {
        expect(mockApiService.getAuctions).toHaveBeenCalledWith(0, 20);
      });

      // When
      const flatList = getByTestId('auction-list');
      fireEvent(flatList, 'onRefresh');

      // Then
      await waitFor(() => {
        expect(mockApiService.getAuctions).toHaveBeenCalledTimes(2); // 초기 + 새로고침
      });
    });
  });

  // === 3. 주요 사용자 플로우 테스트 ===

  describe('전체 사용자 플로우', () => {
    it('사용자가 검색하고 필터링하고 정렬하는 전체 플로우가 작동해야 한다', async () => {
      // Given
      mockApiService.searchAuctions.mockResolvedValue({
        data: mockAuctionData,
        success: true,
        message: '성공',
      });

      const { getByPlaceholderText, getByTestId, getByText } = render(<AuctionListScreen />);
      
      // 초기 로딩 완료 대기
      await waitFor(() => {
        expect(mockApiService.getAuctions).toHaveBeenCalled();
      });

      // When - 복합 조건 검색
      // 1. 검색어 입력
      const searchInput = getByPlaceholderText('상품명, 브랜드를 검색하세요');
      fireEvent.changeText(searchInput, '아이폰');

      // 2. 카테고리 선택
      const categoryFilter = getByTestId('category-filter-button');
      fireEvent.press(categoryFilter);
      const electronicsOption = getByText('전자제품');
      fireEvent.press(electronicsOption);

      // 3. 정렬 선택
      const sortButton = getByTestId('sort-button');
      fireEvent.press(sortButton);
      const priceAscOption = getByText('낮은 가격순');
      fireEvent.press(priceAscOption);

      // 4. 검색 실행
      const searchButton = getByTestId('search-button');
      fireEvent.press(searchButton);

      // Then
      await waitFor(() => {
        expect(mockApiService.searchAuctions).toHaveBeenCalledWith({
          keyword: '아이폰',
          category: 'ELECTRONICS',
          sortBy: 'PRICE_ASC',
        }, 0, 20);
      });
    });
  });
});