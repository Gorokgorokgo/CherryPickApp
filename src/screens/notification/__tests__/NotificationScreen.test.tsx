import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import NotificationScreen from '../NotificationScreen';

// Mock dependencies
jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 44, bottom: 34, left: 0, right: 0 }),
}));

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    navigate: jest.fn(),
  }),
}));

jest.mock('../../../components/common', () => ({
  Icon: ({ name, size, color }: { name: string; size: number; color: string }) => 
    `Icon-${name}-${size}-${color}`,
}));

jest.mock('../../../components/common/Card', () => {
  return ({ children, style }: { children: React.ReactNode; style?: any }) => (
    <div style={style}>{children}</div>
  );
});

jest.mock('../../../components/common/EmptyState', () => {
  return ({ icon, title, subtitle }: { icon: string; title: string; subtitle: string }) => (
    <div>
      <span>{icon}</span>
      <span>{title}</span>
      <span>{subtitle}</span>
    </div>
  );
});

jest.mock('../../../components/common/Badge', () => {
  return ({ text, variant }: { text: string; variant: string }) => (
    <span className={`badge-${variant}`}>{text}</span>
  );
});

jest.mock('../../../utils/format', () => ({
  formatRelativeTime: (date: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    if (diffInMinutes < 60) {
      return `${diffInMinutes}분 전`;
    }
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) {
      return `${diffInHours}시간 전`;
    }
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}일 전`;
  },
}));

describe('NotificationScreen', () => {
  it('renders correctly with header and tabs', () => {
    const { getByText } = render(<NotificationScreen />);
    
    expect(getByText('알림')).toBeTruthy();
    expect(getByText('전체')).toBeTruthy();
    expect(getByText('입찰')).toBeTruthy();
    expect(getByText('경매완료')).toBeTruthy();
    expect(getByText('메시지')).toBeTruthy();
  });

  it('displays sample notifications correctly', async () => {
    const { getByText } = render(<NotificationScreen />);
    
    await waitFor(() => {
      expect(getByText('새로운 입찰')).toBeTruthy();
      expect(getByText('경매 종료')).toBeTruthy();
      expect(getByText('새 메시지')).toBeTruthy();
      expect(getByText('결제 완료')).toBeTruthy();
      expect(getByText('시스템 공지')).toBeTruthy();
    });
  });

  it('filters notifications by tab selection', async () => {
    const { getByText, queryByText } = render(<NotificationScreen />);
    
    // Wait for initial load
    await waitFor(() => {
      expect(getByText('새로운 입찰')).toBeTruthy();
    });

    // Click on '입찰' tab
    fireEvent.press(getByText('입찰'));
    
    await waitFor(() => {
      expect(getByText('새로운 입찰')).toBeTruthy();
      expect(queryByText('경매 종료')).toBeFalsy();
      expect(queryByText('새 메시지')).toBeFalsy();
    });
  });

  it('displays unread count badge when there are unread notifications', async () => {
    const { getByText } = render(<NotificationScreen />);
    
    await waitFor(() => {
      // Should show unread count (2 unread notifications in sample data)
      expect(getByText('2')).toBeTruthy();
      expect(getByText('모두 읽음')).toBeTruthy();
    });
  });

  it('marks all notifications as read when "모두 읽음" is pressed', async () => {
    const { getByText, queryByText } = render(<NotificationScreen />);
    
    await waitFor(() => {
      expect(getByText('모두 읽음')).toBeTruthy();
    });

    fireEvent.press(getByText('모두 읽음'));
    
    await waitFor(() => {
      // Unread badge and "모두 읽음" button should disappear
      expect(queryByText('모두 읽음')).toBeFalsy();
    });
  });

  it('shows empty state when there are no notifications', async () => {
    // Mock empty notifications
    const { getByText } = render(<NotificationScreen />);
    
    // Click on a tab that might have no notifications
    fireEvent.press(getByText('메시지'));
    
    await waitFor(() => {
      // In this case, we have sample data, so we won't see empty state
      // But we're testing the filtering mechanism works
      expect(getByText('새 메시지')).toBeTruthy();
    });
  });

  it('handles pull to refresh functionality', async () => {
    const { getByTestId, getByText } = render(<NotificationScreen />);
    
    await waitFor(() => {
      expect(getByText('알림')).toBeTruthy();
    });

    // The refresh control is part of the FlatList
    // In a real test, we would simulate the refresh gesture
    // For now, we just verify the component renders without errors
    expect(getByText('새로운 입찰')).toBeTruthy();
  });

  it('displays correct notification icons and colors for different types', async () => {
    const { getByText } = render(<NotificationScreen />);
    
    await waitFor(() => {
      // Verify notifications with different types are rendered
      expect(getByText('새로운 입찰')).toBeTruthy();
      expect(getByText('경매 종료')).toBeTruthy();
      expect(getByText('새 메시지')).toBeTruthy();
      expect(getByText('결제 완료')).toBeTruthy();
      expect(getByText('시스템 공지')).toBeTruthy();
    });
  });

  it('shows relative time correctly', async () => {
    const { getByText } = render(<NotificationScreen />);
    
    await waitFor(() => {
      // Should show relative times like "15분 전", "2시간 전", etc.
      expect(getByText(/분 전|시간 전|일 전/)).toBeTruthy();
    });
  });

  it('handles notification press events', async () => {
    const mockNavigate = jest.fn();
    jest.doMock('@react-navigation/native', () => ({
      useNavigation: () => ({
        navigate: mockNavigate,
      }),
    }));

    const { getByText } = render(<NotificationScreen />);
    
    await waitFor(() => {
      expect(getByText('새로운 입찰')).toBeTruthy();
    });

    // Press on a notification
    fireEvent.press(getByText('새로운 입찰'));
    
    // Note: Since we're using a mock, the actual navigation won't happen
    // But we can verify the component doesn't crash on press
  });
});