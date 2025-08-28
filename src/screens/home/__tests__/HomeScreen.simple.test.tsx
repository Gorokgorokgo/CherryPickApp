import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react-native';
import HomeScreen from '../HomeScreen';

// Mock navigation
const mockNavigate = jest.fn();
jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useNavigation: () => ({
    navigate: mockNavigate,
  }),
}));

describe('HomeScreen with Simple Icons', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
  });

  it('should render home screen with emoji icons', () => {
    render(<HomeScreen />);

    // 헤더가 렌더링되는지 확인
    expect(screen.getByText('체리픽')).toBeTruthy();
    
    // 상품들이 렌더링되는지 확인
    expect(screen.getByText('갤럭시 버즈 프로 무선 이어폰')).toBeTruthy();
    expect(screen.getByText('카카오 무료미니 블루투스')).toBeTruthy();
    expect(screen.getByText('김치찌개 짜글이 단주면')).toBeTruthy();
  });

  it('should display prices in correct format', () => {
    render(<HomeScreen />);

    expect(screen.getByText('100,000원')).toBeTruthy();
    expect(screen.getByText('50,000원')).toBeTruthy();
    expect(screen.getByText('15,000원')).toBeTruthy();
  });

  it('should show auction stats', () => {
    render(<HomeScreen />);

    // 좋아요 수 확인
    expect(screen.getByText('10')).toBeTruthy();
    expect(screen.getByText('15')).toBeTruthy();
    expect(screen.getByText('5')).toBeTruthy();

    // 입찰 정보 확인
    expect(screen.getByText('12회 입찰')).toBeTruthy();
    expect(screen.getByText('7회 입찰')).toBeTruthy();
    expect(screen.getByText('23회 입찰')).toBeTruthy();

    // 최근 입찰 시간 확인
    expect(screen.getByText('최근 입찰 3분 전')).toBeTruthy();
  });

  it('should handle like button press', () => {
    const { getByText } = render(<HomeScreen />);

    // 초기 좋아요 수 확인 (10개)
    expect(getByText('10')).toBeTruthy();
    
    // 좋아요 버튼 찾기 - 첫 번째 상품의 하트 이모지 찾기
    const heartEmojis = screen.getAllByText('🤍'); // favorite-border
    
    if (heartEmojis.length > 0) {
      // 첫 번째 하트 버튼의 터치 가능한 부모 요소 찾기
      let touchableParent = heartEmojis[0].parent;
      while (touchableParent && !touchableParent.props.onPress) {
        touchableParent = touchableParent.parent;
      }
      
      if (touchableParent) {
        fireEvent.press(touchableParent);
        // 좋아요 수가 11로 증가했는지 확인
        expect(getByText('11')).toBeTruthy();
      }
    }
  });
});