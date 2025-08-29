import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Alert } from 'react-native';
import AuctionCreateScreen from '../AuctionCreateScreen';
import { apiService } from '../../../services/api';
import { launchImageLibrary } from 'react-native-image-picker';

// Mock dependencies
jest.mock('../../../services/api');
jest.mock('react-native-image-picker');
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    navigate: jest.fn(),
    goBack: jest.fn(),
  }),
}));

// Mock Alert
jest.spyOn(Alert, 'alert').mockImplementation(() => {});

const mockApiService = apiService as jest.Mocked<typeof apiService>;
const mockLaunchImageLibrary = launchImageLibrary as jest.MockedFunction<typeof launchImageLibrary>;

describe('AuctionCreateScreen - TDD', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('폼 검증 로직', () => {
    it('필수 필드가 비어있으면 에러 메시지를 보여야 한다', async () => {
      // Given
      const { getByText } = render(<AuctionCreateScreen />);
      const submitButton = getByText('경매 등록하기');

      // When
      fireEvent.press(submitButton);

      // Then
      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalledWith('오류', '제목을 입력해주세요.');
      });
    });

    it('시작가가 희망가보다 클 때 에러를 보여야 한다', async () => {
      // Given
      const { getByPlaceholderText, getByText } = render(<AuctionCreateScreen />);
      
      // When
      fireEvent.changeText(getByPlaceholderText('상품 이름을 입력하세요'), '테스트 제품');
      fireEvent.changeText(getByPlaceholderText('상세 내용을 입력하세요'), '설명');
      fireEvent.press(getByText('카테고리 선택'));
      fireEvent.press(getByText('전자제품'));
      fireEvent.changeText(getByPlaceholderText('가격을 입력하세요'), '1000000');
      fireEvent.changeText(getByPlaceholderText('희망구매 가격 (선택)'), '500000');
      
      // Add image first
      mockLaunchImageLibrary.mockImplementation((options, callback) => {
        callback({
          assets: [{ uri: 'file://test-image.jpg' }],
        });
      });
      fireEvent.press(getByText('사진 추가'));
      
      fireEvent.press(getByText('경매 등록하기'));

      // Then
      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalledWith('오류', '시작가는 희망가보다 클 수 없습니다.');
      });
    });

    it('100원 단위가 아닌 가격을 입력하면 에러를 보여야 한다', async () => {
      // Given
      const { getByPlaceholderText, getByText } = render(<AuctionCreateScreen />);
      
      // When
      fireEvent.changeText(getByPlaceholderText('상품 이름을 입력하세요'), '테스트 제품');
      fireEvent.changeText(getByPlaceholderText('상세 내용을 입력하세요'), '설명');
      fireEvent.press(getByText('카테고리 선택'));
      fireEvent.press(getByText('전자제품'));
      fireEvent.changeText(getByPlaceholderText('가격을 입력하세요'), '10050'); // 50원 단위
      fireEvent.changeText(getByPlaceholderText('희망구매 가격 (선택)'), '20000');
      
      // Add image first
      mockLaunchImageLibrary.mockImplementation((options, callback) => {
        callback({
          assets: [{ uri: 'file://test-image.jpg' }],
        });
      });
      fireEvent.press(getByText('사진 추가'));
      
      fireEvent.press(getByText('경매 등록하기'));

      // Then
      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalledWith('오류', '시작가는 100원 단위로 설정해주세요.');
      });
    });
  });

  describe('API 연동', () => {
    it('유효한 데이터로 경매 등록이 성공해야 한다', async () => {
      // Given
      mockApiService.createAuction = jest.fn().mockResolvedValue({
        data: { id: 1, title: '테스트 경매' },
        success: true,
        message: '경매가 등록되었습니다.',
      });

      // Mock image picker response
      mockLaunchImageLibrary.mockImplementation((options, callback) => {
        callback({
          assets: [{ uri: 'file://test-image.jpg' }],
        });
      });

      const { getByPlaceholderText, getByText } = render(<AuctionCreateScreen />);

      // When
      fireEvent.changeText(getByPlaceholderText('상품 이름을 입력하세요'), '아이폰 14 Pro');
      fireEvent.changeText(getByPlaceholderText('상세 내용을 입력하세요'), '깨끗한 상태입니다');
      fireEvent.press(getByText('카테고리 선택'));
      fireEvent.press(getByText('전자제품'));
      fireEvent.changeText(getByPlaceholderText('가격을 입력하세요'), '800000');
      fireEvent.changeText(getByPlaceholderText('희망구매 가격 (선택)'), '1000000');
      
      // Add image first
      fireEvent.press(getByText('사진 추가'));
      
      fireEvent.press(getByText('경매 등록하기'));

      // Then
      await waitFor(() => {
        expect(mockApiService.createAuction).toHaveBeenCalledWith({
          title: '아이폰 14 Pro',
          description: '깨끗한 상태입니다',
          category: expect.any(String),
          startPrice: 800000,
          hopePrice: 1000000,
          auctionTimeHours: expect.any(Number),
          regionScope: expect.any(String),
          regionCode: expect.any(String),
          regionName: expect.any(String),
          imageUrls: expect.any(Array),
        });
      });
    });

    it('네트워크 오류 시 적절한 에러 메시지를 보여야 한다', async () => {
      // Given
      mockApiService.createAuction = jest.fn().mockRejectedValue(new Error('네트워크 연결을 확인해주세요.'));

      // Mock image picker response
      mockLaunchImageLibrary.mockImplementation((options, callback) => {
        callback({
          assets: [{ uri: 'file://test-image.jpg' }],
        });
      });

      const { getByPlaceholderText, getByText } = render(<AuctionCreateScreen />);

      // When - 유효한 데이터 입력
      fireEvent.changeText(getByPlaceholderText('상품 이름을 입력하세요'), '테스트 제품');
      fireEvent.changeText(getByPlaceholderText('상세 내용을 입력하세요'), '설명');
      fireEvent.press(getByText('카테고리 선택'));
      fireEvent.press(getByText('전자제품'));
      fireEvent.changeText(getByPlaceholderText('가격을 입력하세요'), '500000');
      fireEvent.changeText(getByPlaceholderText('희망구매 가격 (선택)'), '1000000');
      
      // Add image first
      fireEvent.press(getByText('사진 추가'));
      
      fireEvent.press(getByText('경매 등록하기'));

      // Then
      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalledWith('오류', '네트워크 연결을 확인해주세요.');
      });
    });
  });

  describe('사용자 인터랙션', () => {
    it('카테고리 선택 시 상태가 업데이트되어야 한다', () => {
      // Given
      const { getByText } = render(<AuctionCreateScreen />);

      // When
      fireEvent.press(getByText('카테고리 선택'));
      fireEvent.press(getByText('전자제품'));

      // Then
      expect(getByText('전자제품')).toBeTruthy();
    });

    it('이미지 추가 버튼을 눌렀을 때 이미지 선택이 가능해야 한다', () => {
      // Given
      const { getByText } = render(<AuctionCreateScreen />);

      // When
      fireEvent.press(getByText('사진 추가'));

      // Then
      expect(mockLaunchImageLibrary).toHaveBeenCalled();
    });
  });
});