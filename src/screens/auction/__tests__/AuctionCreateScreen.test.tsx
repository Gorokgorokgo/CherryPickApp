import React from 'react';
import {render, fireEvent} from '@testing-library/react-native';
import {NavigationContainer} from '@react-navigation/native';
import AuctionCreateScreen from '../AuctionCreateScreen';

const mockNavigate = jest.fn();
const mockGoBack = jest.fn();

jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useNavigation: () => ({
    navigate: mockNavigate,
    goBack: mockGoBack,
    setOptions: jest.fn(),
  }),
}));

const renderWithNavigation = (component: React.ReactElement) => {
  return render(
    <NavigationContainer>
      {component}
    </NavigationContainer>
  );
};

describe('AuctionCreateScreen', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
    mockGoBack.mockClear();
  });

  it('renders step 1 (product information) initially', () => {
    const {getByText, getByPlaceholderText} = renderWithNavigation(
      <AuctionCreateScreen />
    );
    
    expect(getByText('상품 정보')).toBeTruthy();
    expect(getByPlaceholderText('상품명을 입력하세요')).toBeTruthy();
    expect(getByPlaceholderText('상품에 대한 자세한 설명을 입력하세요')).toBeTruthy();
  });

  it('validates required fields in step 1', () => {
    const {getByText} = renderWithNavigation(<AuctionCreateScreen />);
    
    const nextButton = getByText('다음');
    fireEvent.press(nextButton);
    
    // 필수 필드가 비어있으면 다음 단계로 진행되지 않음
    expect(getByText('상품 정보')).toBeTruthy(); // 여전히 1단계
  });

  it('proceeds to step 2 when step 1 is filled correctly', () => {
    const {getByText, getByPlaceholderText} = renderWithNavigation(
      <AuctionCreateScreen />
    );
    
    // 필수 필드 입력
    const titleInput = getByPlaceholderText('상품명을 입력하세요');
    const descInput = getByPlaceholderText('상품에 대한 자세한 설명을 입력하세요');
    
    fireEvent.changeText(titleInput, '테스트 상품');
    fireEvent.changeText(descInput, '테스트 설명');
    
    // 카테고리 선택 (버튼 press 시뮬레이션)
    const categoryButton = getByText('카테고리를 선택하세요');
    fireEvent.press(categoryButton);
    
    const nextButton = getByText('다음');
    fireEvent.press(nextButton);
    
    // 2단계로 진행되었는지 확인
    expect(getByText('경매 설정')).toBeTruthy();
  });

  it('shows character count for title input', () => {
    const {getByText, getByPlaceholderText} = renderWithNavigation(
      <AuctionCreateScreen />
    );
    
    const titleInput = getByPlaceholderText('상품명을 입력하세요');
    fireEvent.changeText(titleInput, 'Test');
    
    expect(getByText('4/50')).toBeTruthy();
  });

  it('navigates back when back button is pressed', () => {
    const {getByText} = renderWithNavigation(<AuctionCreateScreen />);
    
    // 2단계로 이동
    const titleInput = getByPlaceholderText('상품명을 입력하세요');
    fireEvent.changeText(titleInput, '테스트');
    
    const nextButton = getByText('다음');
    fireEvent.press(nextButton);
    
    // 뒤로가기 버튼 클릭
    const backButton = getByText('이전');
    fireEvent.press(backButton);
    
    // 1단계로 돌아갔는지 확인
    expect(getByText('상품 정보')).toBeTruthy();
  });
});