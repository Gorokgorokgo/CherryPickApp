import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Card from '../../components/common/Card';
import EmptyState from '../../components/common/EmptyState';
import Badge from '../../components/common/Badge';
import { formatCurrency, formatTimeRemaining } from '../../utils/format';

interface BidItem {
  id: string;
  auctionId: string;
  title: string;
  image: string;
  myBidAmount: number;
  currentPrice: number;
  isWinning: boolean;
  endTime: Date;
  status: 'active' | 'won' | 'lost' | 'ended';
  category: string;
  bidCount: number;
  createdAt: Date;
}

interface MyBidsScreenProps {
  navigation: any;
}

const MyBidsScreen: React.FC<MyBidsScreenProps> = ({ navigation }) => {
  const [bids, setBids] = useState<BidItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedTab, setSelectedTab] = useState<string>('active');

  const tabs = [
    { key: 'active', label: '진행 중', count: 3 },
    { key: 'won', label: '낙찰', count: 2 },
    { key: 'lost', label: '유찰', count: 1 },
  ];

  // 샘플 데이터
  const sampleBids: BidItem[] = [
    {
      id: '1',
      auctionId: 'auction_123',
      title: '아이패드 Pro 12.9인치 M2 (256GB)',
      image: 'https://example.com/ipad.jpg',
      myBidAmount: 850000,
      currentPrice: 850000,
      isWinning: true,
      endTime: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2시간 후
      status: 'active',
      category: '태블릿',
      bidCount: 8,
      createdAt: new Date('2024-08-21 14:30'),
    },
    {
      id: '2',
      auctionId: 'auction_124',
      title: '갤럭시 워치 6 Classic 47mm',
      image: 'https://example.com/watch.jpg',
      myBidAmount: 280000,
      currentPrice: 320000,
      isWinning: false,
      endTime: new Date(Date.now() + 5 * 60 * 60 * 1000), // 5시간 후
      status: 'active',
      category: '웨어러블',
      bidCount: 12,
      createdAt: new Date('2024-08-21 12:15'),
    },
    {
      id: '3',
      auctionId: 'auction_125',
      title: '에어팟 프로 2세대',
      image: 'https://example.com/airpods.jpg',
      myBidAmount: 180000,
      currentPrice: 185000,
      isWinning: false,
      endTime: new Date(Date.now() + 12 * 60 * 60 * 1000), // 12시간 후
      status: 'active',
      category: '이어폰',
      bidCount: 6,
      createdAt: new Date('2024-08-21 10:45'),
    },
    {
      id: '4',
      auctionId: 'auction_120',
      title: 'MacBook Air M2 13인치 (512GB)',
      image: 'https://example.com/macbook.jpg',
      myBidAmount: 1200000,
      currentPrice: 1200000,
      isWinning: true,
      endTime: new Date('2024-08-20 18:00'),
      status: 'won',
      category: '노트북',
      bidCount: 15,
      createdAt: new Date('2024-08-20 17:45'),
    },
    {
      id: '5',
      auctionId: 'auction_119',
      title: '아이폰 15 Pro 256GB',
      image: 'https://example.com/iphone.jpg',
      myBidAmount: 1150000,
      currentPrice: 1150000,
      isWinning: true,
      endTime: new Date('2024-08-19 20:00'),
      status: 'won',
      category: '스마트폰',
      bidCount: 22,
      createdAt: new Date('2024-08-19 19:30'),
    },
    {
      id: '6',
      auctionId: 'auction_118',
      title: '닌텐도 스위치 OLED',
      image: 'https://example.com/switch.jpg',
      myBidAmount: 320000,
      currentPrice: 350000,
      isWinning: false,
      endTime: new Date('2024-08-18 16:00'),
      status: 'lost',
      category: '게임기',
      bidCount: 9,
      createdAt: new Date('2024-08-18 15:20'),
    },
  ];

  useEffect(() => {
    loadBids();
  }, [selectedTab]);

  const loadBids = async () => {
    setLoading(true);
    try {
      // TODO: API 호출
      await new Promise<void>(resolve => setTimeout(() => resolve(), 1000));
      
      let filteredBids = sampleBids;
      if (selectedTab !== 'active') {
        filteredBids = sampleBids.filter(bid => bid.status === selectedTab);
      } else {
        filteredBids = sampleBids.filter(bid => bid.status === 'active');
      }
      
      setBids(filteredBids);
    } catch (error) {
      console.error('입찰 내역 로드 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadBids();
    setRefreshing(false);
  };

  const handleBidPress = (bid: BidItem) => {
    navigation.navigate('AuctionDetail', { auctionId: bid.auctionId });
  };

  const getStatusBadge = (bid: BidItem) => {
    if (bid.status === 'active') {
      if (bid.isWinning) {
        return <Badge text="최고가" variant="success" />;
      } else {
        return <Badge text="참여중" variant="warning" />;
      }
    } else if (bid.status === 'won') {
      return <Badge text="낙찰" variant="success" />;
    } else if (bid.status === 'lost') {
      return <Badge text="유찰" variant="error" />;
    }
    return null;
  };

  const getTimeDisplay = (bid: BidItem) => {
    if (bid.status === 'active') {
      return formatTimeRemaining(bid.endTime);
    } else {
      return bid.endTime.toLocaleDateString('ko-KR', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    }
  };

  const renderTabButton = (tab: { key: string; label: string; count: number }) => (
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
      {tab.count > 0 && (
        <View style={styles.tabBadge}>
          <Text style={styles.tabBadgeText}>{tab.count}</Text>
        </View>
      )}
    </TouchableOpacity>
  );

  const renderBidItem = ({ item }: { item: BidItem }) => (
    <TouchableOpacity
      style={styles.bidItem}
      onPress={() => handleBidPress(item)}
    >
      <Card style={styles.bidCard}>
        <View style={styles.bidContent}>
          <View style={styles.bidImage}>
            <Icon name="image" size={48} color="#ccc" />
          </View>
          
          <View style={styles.bidDetails}>
            <View style={styles.bidHeader}>
              <Text style={styles.bidTitle} numberOfLines={2}>
                {item.title}
              </Text>
              {getStatusBadge(item)}
            </View>
            
            <Text style={styles.bidCategory}>{item.category}</Text>
            
            <View style={styles.bidStats}>
              <View style={styles.bidStatItem}>
                <Text style={styles.bidStatLabel}>내 입찰가</Text>
                <Text style={[
                  styles.bidStatValue,
                  { color: item.isWinning ? '#4CAF50' : '#666' }
                ]}>
                  {formatCurrency(item.myBidAmount)}원
                </Text>
              </View>
              
              {item.status === 'active' && (
                <View style={styles.bidStatItem}>
                  <Text style={styles.bidStatLabel}>현재가</Text>
                  <Text style={[
                    styles.bidStatValue,
                    { color: item.isWinning ? '#4CAF50' : '#FF6B6B' }
                  ]}>
                    {formatCurrency(item.currentPrice)}원
                  </Text>
                </View>
              )}
            </View>
            
            <View style={styles.bidFooter}>
              <View style={styles.bidInfo}>
                <Icon name="people" size={14} color="#999" />
                <Text style={styles.bidInfoText}>
                  {item.bidCount}명 참여
                </Text>
              </View>
              
              <Text style={[
                styles.bidTime,
                item.status === 'active' && styles.activeTime
              ]}>
                {item.status === 'active' && '⏰ '}
                {getTimeDisplay(item)}
              </Text>
            </View>
          </View>
        </View>
      </Card>
    </TouchableOpacity>
  );

  const getEmptyStateConfig = () => {
    switch (selectedTab) {
      case 'active':
        return {
          icon: 'gavel',
          title: '참여 중인 경매가 없습니다',
          subtitle: '관심있는 상품에 입찰해보세요',
        };
      case 'won':
        return {
          icon: 'emoji-events',
          title: '낙찰받은 경매가 없습니다',
          subtitle: '경매에 참여해서 원하는 상품을 낙찰받아보세요',
        };
      case 'lost':
        return {
          icon: 'sentiment-neutral',
          title: '유찰된 경매가 없습니다',
          subtitle: '더 높은 가격으로 입찰해보세요',
        };
      default:
        return {
          icon: 'gavel',
          title: '입찰 내역이 없습니다',
          subtitle: '경매에 참여해보세요',
        };
    }
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
        <Text style={styles.headerTitle}>내 입찰 현황</Text>
        <View style={styles.headerRight} />
      </View>

      <View style={styles.tabContainer}>
        {tabs.map(renderTabButton)}
      </View>

      <View style={styles.content}>
        {bids.length === 0 ? (
          <EmptyState {...getEmptyStateConfig()} />
        ) : (
          <FlatList
            data={bids}
            renderItem={renderBidItem}
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
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  headerRight: {
    width: 40,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    paddingHorizontal: 16,
  },
  tabButton: {
    flexDirection: 'row',
    alignItems: 'center',
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
  tabBadge: {
    marginLeft: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
    backgroundColor: '#FF6B6B',
    borderRadius: 10,
    minWidth: 18,
    alignItems: 'center',
  },
  tabBadgeText: {
    fontSize: 11,
    color: 'white',
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  listContainer: {
    padding: 16,
  },
  bidItem: {
    marginBottom: 12,
  },
  bidCard: {
    padding: 16,
    backgroundColor: 'white',
  },
  bidContent: {
    flexDirection: 'row',
  },
  bidImage: {
    width: 80,
    height: 80,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  bidDetails: {
    flex: 1,
  },
  bidHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  bidTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    flex: 1,
    marginRight: 8,
    lineHeight: 22,
  },
  bidCategory: {
    fontSize: 12,
    color: '#999',
    marginBottom: 12,
  },
  bidStats: {
    flexDirection: 'row',
    gap: 20,
    marginBottom: 12,
  },
  bidStatItem: {
    alignItems: 'flex-start',
  },
  bidStatLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  bidStatValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  bidFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  bidInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bidInfoText: {
    fontSize: 12,
    color: '#999',
    marginLeft: 4,
  },
  bidTime: {
    fontSize: 12,
    color: '#666',
  },
  activeTime: {
    color: '#FF6B6B',
    fontWeight: '500',
  },
});

export default MyBidsScreen;