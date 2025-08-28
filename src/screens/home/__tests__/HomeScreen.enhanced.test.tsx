import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react-native';
import HomeScreen from '../HomeScreen';

// Mock react-native-vector-icons
jest.mock('react-native-vector-icons/MaterialIcons', () => {
  const MockedIcon = ({ name, size, color, ...props }: any) => {
    const MockComponent = require('react-native').Text;
    return <MockComponent {...props} testID={`icon-${name}`}>{`Icon-${name}-${size}-${color}`}</MockComponent>;
  };
  return MockedIcon;
});

// Mock navigation
const mockNavigate = jest.fn();
jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useNavigation: () => ({
    navigate: mockNavigate,
  }),
}));

describe('HomeScreen Enhanced Features', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
  });

  it('should render auction cards with like functionality', () => {
    render(<HomeScreen />);

    // 좋아요 버튼이 렌더링되는지 확인
    const likeButtons = screen.getAllByTestId(/icon-favorite/);
    expect(likeButtons.length).toBeGreaterThan(0);
  });

  it('should toggle like status when like button is pressed', () => {
    render(<HomeScreen />);

    // 좋아요 상태가 false인 첫 번째 아이템의 좋아요 버튼 찾기
    const likeButtons = screen.getAllByTestId('icon-favorite-border');
    const firstLikeButton = likeButtons[0];
    
    // 좋아요 버튼의 부모 TouchableOpacity 클릭
    fireEvent.press(firstLikeButton.parent);
    
    // 좋아요 상태가 변경되었는지 확인 (여러 개가 있을 수 있으므로 getAllByTestId 사용)
    const favoriteIcons = screen.getAllByTestId('icon-favorite');
    expect(favoriteIcons.length).toBeGreaterThan(0);
  });

  it('should display auction metrics (like count, bid count, last bid time)', () => {
    render(<HomeScreen />);

    // 좋아요 수 표시 확인
    expect(screen.getByText('10')).toBeTruthy(); // 첫 번째 경매의 좋아요 수
    expect(screen.getByText('15')).toBeTruthy(); // 두 번째 경매의 좋아요 수

    // 입찰 회수 표시 확인
    expect(screen.getByText('12회 입찰')).toBeTruthy();
    expect(screen.getByText('7회 입찰')).toBeTruthy();

    // 최근 입찰 시간 표시 확인
    expect(screen.getByText('최근 입찰 3분 전')).toBeTruthy();
    expect(screen.getByText('최근 입찰 7분 전')).toBeTruthy();
  });

  it('should display updated dummy data with Korean product names', () => {
    render(<HomeScreen />);

    // 새로운 더미 데이터의 상품명들이 표시되는지 확인
    expect(screen.getByText('갤럭시 버즈 프로 무선 이어폰')).toBeTruthy();
    expect(screen.getByText('카카오 무료미니 블루투스')).toBeTruthy();
    expect(screen.getByText('김치찌개 짜글이 단주면')).toBeTruthy();
  });

  it('should handle like button press and update like count', () => {
    const { getByText } = render(<HomeScreen />);

    // 초기 좋아요 수 확인 (10개)
    expect(getByText('10')).toBeTruthy();
    
    // 좋아요 버튼 찾기 (favorite-border 아이콘을 가진 첫 번째 버튼)
    const likeButtons = screen.getAllByTestId('icon-favorite-border');
    const likeButton = likeButtons[0].parent;
    
    // 좋아요 버튼 클릭
    fireEvent.press(likeButton!);
    
    // 좋아요 수가 11로 증가했는지 확인
    expect(getByText('11')).toBeTruthy();
  });

  it('should show correct auction prices in Korean format', () => {
    render(<HomeScreen />);

    // 가격이 올바른 한국어 형식으로 표시되는지 확인
    expect(screen.getByText('100,000원')).toBeTruthy(); // 갤럭시 버즈
    expect(screen.getByText('50,000원')).toBeTruthy();  // 카카오 미니
    expect(screen.getByText('15,000원')).toBeTruthy();  // 김치찌개 면
  });

  it('should display location information for each auction', () => {
    render(<HomeScreen />);

    // 위치 정보가 표시되는지 확인
    expect(screen.getByText('서울시 강남구')).toBeTruthy();
    expect(screen.getByText('경기도 성남시')).toBeTruthy();
    expect(screen.getByText('부산시 해운대구')).toBeTruthy();
  });

  it('should navigate to auction detail when auction card is pressed', () => {
    render(<HomeScreen />);

    // 첫 번째 경매 카드의 TouchableOpacity 찾기 (제목 텍스트의 상위 요소들 중에서)
    const titleText = screen.getByText('갤럭시 버즈 프로 무선 이어폰');
    let cardElement = titleText.parent;
    
    // TouchableOpacity까지 올라가기
    while (cardElement && !cardElement.props.onPress) {
      cardElement = cardElement.parent;
    }
    
    if (cardElement) {
      fireEvent.press(cardElement);
      expect(mockNavigate).toHaveBeenCalledWith('AuctionDetail', { auctionId: '1' });
    }
  });
});