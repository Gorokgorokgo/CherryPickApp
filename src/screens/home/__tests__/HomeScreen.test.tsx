import React from 'react';
import {render, fireEvent} from '@testing-library/react-native';
import {NavigationContainer} from '@react-navigation/native';
import HomeScreen from '../HomeScreen';

// Mock navigation
const mockNavigate = jest.fn();
jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useNavigation: () => ({
    navigate: mockNavigate,
  }),
}));

const renderWithNavigation = (component: React.ReactElement) => {
  return render(
    <NavigationContainer>
      {component}
    </NavigationContainer>
  );
};

describe('HomeScreen', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
  });

  it('renders correctly with auction list', () => {
    const {getByText} = renderWithNavigation(<HomeScreen />);
    
    expect(getByText('체리픽')).toBeTruthy();
    expect(getByText('당신만의 특별한 경매를 찾아보세요')).toBeTruthy();
  });

  it('shows search functionality', () => {
    const {getByPlaceholderText} = renderWithNavigation(<HomeScreen />);
    
    expect(getByPlaceholderText('원하는 상품을 검색해보세요')).toBeTruthy();
  });

  it('displays auction cards', () => {
    const {getByText} = renderWithNavigation(<HomeScreen />);
    
    // Mock 데이터에서 첫 번째 경매 아이템 확인
    expect(getByText('아이폰 14 Pro Max')).toBeTruthy();
  });

  it('opens search modal when search input is pressed', () => {
    const {getByPlaceholderText} = renderWithNavigation(<HomeScreen />);
    
    const searchInput = getByPlaceholderText('원하는 상품을 검색해보세요');
    fireEvent.press(searchInput);
    
    // 검색 모달이 열렸는지 확인 (모달 내 요소로 확인)
    expect(getByText('검색')).toBeTruthy();
  });

  it('navigates to auction detail when card is pressed', () => {
    const {getByText} = renderWithNavigation(<HomeScreen />);
    
    const auctionCard = getByText('아이폰 14 Pro Max');
    fireEvent.press(auctionCard);
    
    expect(mockNavigate).toHaveBeenCalledWith('AuctionDetail', {auctionId: '1'});
  });
});