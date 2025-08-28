import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../navigation/AppNavigator';
import { Icon } from '../../components/common';
import Card from '../../components/common/Card';
import EmptyState from '../../components/common/EmptyState';
import Badge from '../../components/common/Badge';
import { formatRelativeTime } from '../../utils/format';

type NotificationScreenNavigationProp = StackNavigationProp<RootStackParamList>;

interface Notification {
  id: string;
  type: 'bid' | 'auction_end' | 'payment' | 'message' | 'system';
  title: string;
  message: string;
  createdAt: Date;
  isRead: boolean;
  auctionId?: string;
  chatRoomId?: string;
  imageUrl?: string;
}

interface NotificationScreenProps {
  navigation?: NotificationScreenNavigationProp;
}

const NotificationScreen: React.FC<NotificationScreenProps> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const nav = useNavigation<NotificationScreenNavigationProp>();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedTab, setSelectedTab] = useState<string>('all');

  const tabs = [
    { key: 'all', label: '전체' },
    { key: 'bid', label: '입찰' },
    { key: 'auction_end', label: '경매완료' },
    { key: 'message', label: '메시지' },
  ];

  // 샘플 데이터
  const sampleNotifications: Notification[] = [
    {
      id: 'notif_1',
      type: 'bid',
      title: '새로운 입찰',
      message: '"맥북 프로 13인치 M1"에 새로운 입찰이 있습니다.',
      createdAt: new Date(Date.now() - 1000 * 60 * 15), // 15분 전
      isRead: false,
      auctionId: 'auction_123',
    },
    {
      id: 'notif_2',
      type: 'auction_end',
      title: '경매 종료',
      message: '"아이패드 Pro 12.9인치" 경매가 종료되었습니다. 낙찰자로 선정되셨습니다!',
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2시간 전
      isRead: false,
      auctionId: 'auction_124',
    },
    {
      id: 'notif_3',
      type: 'message',
      title: '새 메시지',
      message: '김판매자님이 메시지를 보냈습니다.',
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 4), // 4시간 전
      isRead: true,
      chatRoomId: 'chat_1',
    },
    {
      id: 'notif_4',
      type: 'payment',
      title: '결제 완료',
      message: '연결 서비스 결제가 완료되었습니다. 판매자와 연결됩니다.',
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 6), // 6시간 전
      isRead: true,
      auctionId: 'auction_125',
    },
    {
      id: 'notif_5',
      type: 'system',
      title: '공지 사항',
      message: '체리픽 앱이 업데이트되었습니다. 새로운 기능을 확인해보세요!',
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1일 전
      isRead: true,
    },
  ];

  useEffect(() => {
    loadNotifications();
  }, [selectedTab]);

  const loadNotifications = async () => {
    setLoading(true);
    try {
      // TODO: API 호출
      await new Promise<void>(resolve => setTimeout(() => resolve(), 1000));
      
      let filteredNotifications = sampleNotifications;
      if (selectedTab !== 'all') {
        filteredNotifications = sampleNotifications.filter(notif => notif.type === selectedTab);
      }
      
      // 최신 순으로 정렬
      filteredNotifications.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      
      setNotifications(filteredNotifications);
    } catch (error) {
      console.error('알림 목록 로드 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadNotifications();
    setRefreshing(false);
  };

  const handleNotificationPress = async (notification: Notification) => {
    // 읽지 않은 알림을 읽음 상태로 변경
    if (!notification.isRead) {
      setNotifications(prev => 
        prev.map(n => 
          n.id === notification.id 
            ? { ...n, isRead: true }
            : n
        )
      );
    }

    // 알림 타입에 따라 다른 화면으로 이동
    switch (notification.type) {
      case 'bid':
      case 'auction_end':
      case 'payment':
        if (notification.auctionId) {
          nav.navigate('AuctionDetail', { auctionId: notification.auctionId });
        }
        break;
      case 'message':
        if (notification.chatRoomId) {
          nav.navigate('ChatRoom', {
            chatRoomId: notification.chatRoomId,
            auctionId: notification.auctionId || '',
            title: '채팅방',
            partnerName: '상대방',
            partnerType: 'seller',
          });
        }
        break;
      case 'system':
        // 공지 사항의 경우 별도 처리 없음
        break;
    }
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(n => ({ ...n, isRead: true }))
    );
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'bid':
        return 'gavel';
      case 'auction_end':
        return 'check-circle';
      case 'message':
        return 'chat-bubble';
      case 'payment':
        return 'credit-card';
      case 'system':
        return 'campaign'; // 공지사항 아이콘으로 변경
      default:
        return 'notifications';
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'bid':
        return '#FF6B6B';
      case 'auction_end':
        return '#4CAF50';
      case 'message':
        return '#2196F3';
      case 'payment':
        return '#FF9800';
      case 'system':
        return '#9C27B0';
      default:
        return '#666666';
    }
  };

  const renderTabButton = (tab: { key: string; label: string }) => (
    <TouchableOpacity
      key={tab.key}
      style={[
        styles.tabButton,
        selectedTab === tab.key && styles.selectedTabButton,
      ]}
      onPress={() => setSelectedTab(tab.key)}
    >
      <Text
        style={[
          styles.tabButtonText,
          selectedTab === tab.key && styles.selectedTabButtonText,
        ]}
      >
        {tab.label}
      </Text>
    </TouchableOpacity>
  );

  const renderNotification = ({ item }: { item: Notification }) => (
    <TouchableOpacity
      style={styles.notificationItem}
      onPress={() => handleNotificationPress(item)}
    >
      <Card style={[
        styles.notificationCard,
        !item.isRead && styles.unreadCard,
      ]}>
        <View style={styles.notificationContent}>
          {/* 아이콘 */}
          <View style={[
            styles.iconContainer,
            { backgroundColor: getNotificationColor(item.type) },
          ]}>
            <Icon 
              name={getNotificationIcon(item.type)} 
              size={20} 
              color="#FFFFFF" 
            />
          </View>

          {/* 알림 정보 */}
          <View style={styles.notificationInfo}>
            <View style={styles.notificationHeader}>
              <Text style={styles.notificationTitle}>{item.title}</Text>
              <Text style={styles.notificationTime}>
                {formatRelativeTime(item.createdAt)}
              </Text>
            </View>

            <Text 
              style={[
                styles.notificationMessage,
                !item.isRead && styles.unreadMessage,
              ]} 
              numberOfLines={2}
            >
              {item.message}
            </Text>
          </View>

          {/* 읽지 않음 표시 */}
          {!item.isRead && <View style={styles.unreadDot} />}
        </View>
      </Card>
    </TouchableOpacity>
  );

  const getUnreadCount = () => {
    return notifications.filter(n => !n.isRead).length;
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>알림</Text>
          {getUnreadCount() > 0 && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadBadgeText}>{getUnreadCount()}</Text>
            </View>
          )}
        </View>
        
        {getUnreadCount() > 0 && (
          <TouchableOpacity
            style={styles.markAllButton}
            onPress={markAllAsRead}
          >
            <Text style={styles.markAllButtonText}>모두 읽음</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.tabContainer}>
        {tabs.map(renderTabButton)}
      </View>

      <View style={styles.content}>
        {notifications.length === 0 ? (
          <EmptyState
            icon="notifications-off"
            title="알림이 없습니다"
            subtitle="새로운 알림이 도착하면 여기서 확인할 수 있습니다"
          />
        ) : (
          <FlatList
            data={notifications}
            renderItem={renderNotification}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={['#FF6B6B']}
              />
            }
            contentContainerStyle={styles.listContainer}
          />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  unreadBadge: {
    marginLeft: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
    backgroundColor: '#FF6B6B',
    borderRadius: 10,
    minWidth: 18,
    alignItems: 'center',
  },
  unreadBadgeText: {
    fontSize: 11,
    color: 'white',
    fontWeight: '600',
  },
  markAllButton: {
    paddingVertical: 4,
    paddingHorizontal: 12,
  },
  markAllButtonText: {
    fontSize: 14,
    color: '#FF6B6B',
    fontWeight: '500',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    paddingHorizontal: 16,
  },
  tabButton: {
    paddingVertical: 16,
    paddingHorizontal: 8,
    marginRight: 24,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  selectedTabButton: {
    borderBottomColor: '#FF6B6B',
  },
  tabButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#666',
  },
  selectedTabButtonText: {
    color: '#FF6B6B',
  },
  content: {
    flex: 1,
  },
  listContainer: {
    padding: 16,
  },
  notificationItem: {
    marginBottom: 8,
  },
  notificationCard: {
    padding: 16,
    backgroundColor: 'white',
  },
  unreadCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#FF6B6B',
  },
  notificationContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  notificationInfo: {
    flex: 1,
  },
  notificationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    flex: 1,
    marginRight: 8,
  },
  notificationTime: {
    fontSize: 12,
    color: '#999',
  },
  notificationMessage: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  unreadMessage: {
    color: '#333',
    fontWeight: '500',
  },
  unreadDot: {
    width: 8,
    height: 8,
    backgroundColor: '#FF6B6B',
    borderRadius: 4,
    marginLeft: 8,
    marginTop: 4,
  },
});

export default NotificationScreen;