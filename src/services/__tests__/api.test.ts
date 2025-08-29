import { apiService } from '../api';

// Mock fetch for testing
global.fetch = jest.fn();
const mockFetch = fetch as jest.MockedFunction<typeof fetch>;

describe('ApiService - 경매 API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getAuctions', () => {
    it('성공적으로 경매 목록을 조회해야 한다', async () => {
      // Given
      const mockResponse = {
        data: {
          content: [
            {
              id: 1,
              title: '아이폰 14 Pro',
              currentPrice: 1000000,
              startPrice: 800000,
              hopePrice: 1200000,
              category: 'ELECTRONICS',
              regionName: '서울시 강남구',
              bidCount: 5,
              viewCount: 25,
              remainingTimeMs: 3600000,
              isExpired: false,
              imageUrls: ['https://example.com/image1.jpg'],
              sellerNickname: '판매자1',
            }
          ],
          totalPages: 1,
          totalElements: 1,
          first: true,
          last: true,
        },
        message: 'Success',
        success: true,
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockResponse,
      } as Response);

      // When
      const result = await apiService.getAuctions(0, 20);

      // Then
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/auctions?page=0&size=20'),
        expect.objectContaining({
          method: undefined, // GET이 기본값
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
          }),
        })
      );
      expect(result.success).toBe(true);
      expect(result.data.content).toHaveLength(1);
      expect(result.data.content[0].title).toBe('아이폰 14 Pro');
    });

    it('네트워크 오류 시 적절한 에러 메시지를 반환해야 한다', async () => {
      // Given
      mockFetch.mockRejectedValueOnce(new Error('Network request failed'));

      // When & Then
      await expect(apiService.getAuctions()).rejects.toThrow('네트워크 연결을 확인해주세요.');
    });

    it('서버 오류 시 적절한 에러 메시지를 반환해야 한다', async () => {
      // Given
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        json: async () => ({ message: '서버 오류가 발생했습니다.' }),
      } as Response);

      // When & Then
      await expect(apiService.getAuctions()).rejects.toThrow('서버 오류가 발생했습니다.');
    });
  });

  describe('getAuctionsByCategory', () => {
    it('카테고리별 경매 목록을 조회해야 한다', async () => {
      // Given
      const mockResponse = {
        data: { content: [], totalElements: 0 },
        success: true,
      };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      } as Response);

      // When
      await apiService.getAuctionsByCategory('ELECTRONICS', 0, 10);

      // Then
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/auctions/category/ELECTRONICS?page=0&size=10'),
        expect.any(Object)
      );
    });
  });
});