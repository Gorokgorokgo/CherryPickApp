import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Card from '../../components/common/Card';
import EmptyState from '../../components/common/EmptyState';
import Badge from '../../components/common/Badge';
import { formatRelativeTime } from '../../utils/format';

interface ChatRoom {
  id: string;
  auctionId: string;
  title: string;
  partnerName: string;
  partnerType: 'seller' | 'buyer';
  lastMessage: string;
  lastMessageTime: Date;
  unreadCount: number;
  status: 'active' | 'completed' | 'cancelled';
  isOnline: boolean;
  finalPrice: number;
  category: string;
}

interface ChatListScreenProps {
  navigation: any;
}

const ChatListScreen: React.FC<ChatListScreenProps> = ({ navigation }) => {
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedTab, setSelectedTab] = useState<string>('all');

  const tabs = [
    { key: 'all', label: '전체' },
    { key: 'active', label: '진행중' },
    { key: 'completed', label: '완료' },
  ];

  // 샘플 데이터
  const sampleChatRooms: ChatRoom[] = [
    {
      id: 'chat_1',
      auctionId: 'auction_123',
      title: '아이패드 Pro 12.9인치 M2 (256GB)',
      partnerName: '김판매자',
      partnerType: 'seller',
      lastMessage: '네, 내일 오후 2시에 역삼역에서 만나요!',
      lastMessageTime: new Date(Date.now() - 1000 * 60 * 30), // 30분 전
      unreadCount: 2,
      status: 'active',
      isOnline: true,
      finalPrice: 850000,
      category: '태블릿',
    },
    {
      id: 'chat_2',
      auctionId: 'auction_120',
      title: 'MacBook Air M2 13인치 (512GB)',
      partnerName: '박구매자',
      partnerType: 'buyer',
      lastMessage: '거래 완료 처리 해주세요~',
      lastMessageTime: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2시간 전
      unreadCount: 0,
      status: 'active',
      isOnline: false,
      finalPrice: 1200000,
      category: '노트북',
    },
    {
      id: 'chat_3',
      auctionId: 'auction_119',
      title: '아이폰 15 Pro 256GB',
      partnerName: '이구매자',
      partnerType: 'buyer',
      lastMessage: '감사합니다! 거래 완료했어요.',
      lastMessageTime: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1일 전
      unreadCount: 0,
      status: 'completed',
      isOnline: false,
      finalPrice: 1150000,
      category: '스마트폰',
    },
    {
      id: 'chat_4',
      auctionId: 'auction_124',
      title: '갤럭시 워치 6 Classic 47mm',
      partnerName: '최판매자',
      partnerType: 'seller',
      lastMessage: '안녕하세요! 연락드립니다.',
      lastMessageTime: new Date(Date.now() - 1000 * 60 * 60 * 3), // 3시간 전
      unreadCount: 1,
      status: 'active',
      isOnline: true,
      finalPrice: 320000,
      category: '웨어러블',
    },
  ];

  useEffect(() => {
    loadChatRooms();
  }, [selectedTab]);

  const loadChatRooms = async () => {
    setLoading(true);
    try {
      // TODO: API 호출
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      let filteredRooms = sampleChatRooms;
      if (selectedTab !== 'all') {
        filteredRooms = sampleChatRooms.filter(room => room.status === selectedTab);
      }
      
      // 최근 메시지 순으로 정렬
      filteredRooms.sort((a, b) => b.lastMessageTime.getTime() - a.lastMessageTime.getTime());
      
      setChatRooms(filteredRooms);
    } catch (error) {
      console.error('채팅 목록 로드 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadChatRooms();
    setRefreshing(false);
  };

  const handleChatPress = (chatRoom: ChatRoom) => {
    navigation.navigate('ChatRoom', {
      chatRoomId: chatRoom.id,
      auctionId: chatRoom.auctionId,
      title: chatRoom.title,
      partnerName: chatRoom.partnerName,
      partnerType: chatRoom.partnerType,
      isOnline: chatRoom.isOnline,
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge text="진행중" type="success" />;
      case 'completed':
        return <Badge text="완료" type="info" />;
      case 'cancelled':
        return <Badge text="취소" type="error" />;
      default:
        return null;
    }
  };

  const getPartnerTypeText = (partnerType: string) => {
    return partnerType === 'seller' ? '판매자' : '구매자';
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

  const renderChatRoom = ({ item }: { item: ChatRoom }) => (
    <TouchableOpacity
      style={styles.chatRoomItem}
      onPress={() => handleChatPress(item)}
    >
      <Card style={styles.chatRoomCard}>
        <View style={styles.chatRoomContent}>
          {/* 프로필 아바타 */}
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Icon name="person" size={24} color="#666" />
            </View>
            {item.isOnline && <View style={styles.onlineIndicator} />}
          </View>

          {/* 채팅 정보 */}
          <View style={styles.chatInfo}>
            <View style={styles.chatHeader}>
              <View style={styles.chatTitleContainer}>
                <Text style={styles.partnerName}>
                  {item.partnerName} ({getPartnerTypeText(item.partnerType)})
                </Text>
                {getStatusBadge(item.status)}
              </View>
              <Text style={styles.lastMessageTime}>
                {formatRelativeTime(item.lastMessageTime)}
              </Text>
            </View>

            <Text style={styles.auctionTitle} numberOfLines={1}>
              {item.title}
            </Text>

            <View style={styles.lastMessageContainer}>
              <Text
                style={[
                  styles.lastMessage,
                  item.unreadCount > 0 && styles.unreadMessage,
                ]}
                numberOfLines={1}
              >
                {item.lastMessage}
              </Text>
              {item.unreadCount > 0 && (
                <View style={styles.unreadBadge}>
                  <Text style={styles.unreadCount}>{item.unreadCount}</Text>
                </View>
              )}
            </View>
          </View>
        </View>
      </Card>
    </TouchableOpacity>
  );

  const getTotalUnreadCount = () => {
    return chatRooms.reduce((total, room) => total + room.unreadCount, 0);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>채팅</Text>
          {getTotalUnreadCount() > 0 && (
            <View style={styles.headerUnreadBadge}>
              <Text style={styles.headerUnreadText}>{getTotalUnreadCount()}</Text>
            </View>
          )}
        </View>
        <TouchableOpacity
          style={styles.searchButton}
          onPress={() => {/* TODO: 검색 기능 */ }}
        >
          <Icon name="search" size={24} color="#666" />
        </TouchableOpacity>
      </View>

      <View style={styles.tabContainer}>
        {tabs.map(renderTabButton)}
      </View>

      <View style={styles.content}>
        {chatRooms.length === 0 ? (
          <EmptyState
            icon="chat-bubble-outline"
            message="채팅방이 없습니다"
            description="낙찰받은 상품이 있으면 연결 서비스를 통해 채팅을 시작할 수 있습니다"
          />
        ) : (
          <FlatList
            data={chatRooms}
            renderItem={renderChatRoom}
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
    </SafeAreaView>
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
  backButton: {
    padding: 8,
  },
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  headerUnreadBadge: {
    marginLeft: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
    backgroundColor: '#FF6B6B',
    borderRadius: 10,
    minWidth: 18,
    alignItems: 'center',
  },
  headerUnreadText: {
    fontSize: 11,
    color: 'white',
    fontWeight: '600',
  },
  searchButton: {
    padding: 8,
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
  chatRoomItem: {
    marginBottom: 8,
  },
  chatRoomCard: {
    padding: 16,
    backgroundColor: 'white',
  },
  chatRoomContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    backgroundColor: '#f5f5f5',
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 12,
    height: 12,
    backgroundColor: '#4CAF50',
    borderRadius: 6,
    borderWidth: 2,
    borderColor: 'white',
  },
  chatInfo: {
    flex: 1,
  },
  chatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  chatTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
  },
  partnerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginRight: 8,
  },
  lastMessageTime: {
    fontSize: 12,
    color: '#999',
  },
  auctionTitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 6,
  },
  lastMessageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  lastMessage: {
    fontSize: 14,
    color: '#999',
    flex: 1,
  },
  unreadMessage: {
    color: '#333',
    fontWeight: '500',
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
  unreadCount: {
    fontSize: 11,
    color: 'white',
    fontWeight: '600',
  },
});

export default ChatListScreen;