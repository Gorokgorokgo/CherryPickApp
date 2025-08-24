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

  it('navigates to auction detail when card is pressed', () => {
    const {getByText} = renderWithNavigation(<HomeScreen />);
    
    const auctionCard = getByText('아이폰 14 Pro 256GB (상태 좋음)');
    fireEvent.press(auctionCard);
    
    expect(mockNavigate).toHaveBeenCalledWith('AuctionDetail', {auctionId: '1'});
  });
});