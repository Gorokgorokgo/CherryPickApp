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
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../navigation/AppNavigator';
import { Icon } from '../../components/common';
import Card from '../../components/common/Card';
import EmptyState from '../../components/common/EmptyState';

type WishlistScreenNavigationProp = StackNavigationProp<RootStackParamList>;

interface WishlistItem {
  id: string;
  auctionId: string;
  title: string;
  currentPrice: number;
  startPrice: number;
  imageUrl?: string;
  timeLeft: string;
  location: string;
  bidCount: number;
  category: string;
  addedAt: Date;
  status: 'active' | 'ended' | 'closed';
}

interface WishlistScreenProps {
  navigation?: WishlistScreenNavigationProp;
}

const WishlistScreen: React.FC<WishlistScreenProps> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const nav = useNavigation<WishlistScreenNavigationProp>();
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // 샘플 데이터
  const sampleWishlistItems: WishlistItem[] = [
    {
      id: 'wish_1',
      auctionId: 'auction_201',
      title: '아이패드 Pro 11인치 M2 (128GB)',
      currentPrice: 720000,
      startPrice: 500000,
      timeLeft: '3시간 22분',
      location: '서울시 강남구',
      bidCount: 8,
      category: '전자제품',
      addedAt: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2시간 전
      status: 'active',
    },
    {
      id: 'wish_2',
      auctionId: 'auction_202',
      title: '나이키 에어맥스 270 (280mm)',
      currentPrice: 120000,
      startPrice: 80000,
      timeLeft: '1일 14시간',
      location: '부산시 해운대구',
      bidCount: 5,
      category: '패션',
      addedAt: new Date(Date.now() - 1000 * 60 * 60 * 6), // 6시간 전
      status: 'active',
    },
    {
      id: 'wish_3',
      auctionId: 'auction_203',
      title: '삼성 갤럭시 버즈 Pro 2',
      currentPrice: 85000,
      startPrice: 50000,
      timeLeft: '종료됨',
      location: '인천시 연수구',
      bidCount: 12,
      category: '전자제품',
      addedAt: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1일 전
      status: 'ended',
    },
    {
      id: 'wish_4',
      auctionId: 'auction_204',
      title: '애플워치 시리즈 9 (45mm)',
      currentPrice: 380000,
      startPrice: 300000,
      timeLeft: '5시간 45분',
      location: '대구시 중구',
      bidCount: 15,
      category: '웨어러블',
      addedAt: new Date(Date.now() - 1000 * 60 * 30), // 30분 전
      status: 'active',
    },
  ];

  useEffect(() => {
    loadWishlistItems();
  }, []);

  const loadWishlistItems = async () => {
    setLoading(true);
    try {
      // TODO: API 호출
      await new Promise<void>(resolve => setTimeout(() => resolve(), 1000));
      
      // 최근 추가한 순으로 정렬
      const sortedItems = sampleWishlistItems.sort((a, b) => 
        b.addedAt.getTime() - a.addedAt.getTime()
      );
      
      setWishlistItems(sortedItems);
    } catch (error) {
      console.error('찜목록 로드 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadWishlistItems();
    setRefreshing(false);
  };

  const handleItemPress = (item: WishlistItem) => {
    nav.navigate('AuctionDetail', { auctionId: item.auctionId });
  };

  const handleRemoveFromWishlist = (itemId: string) => {
    setWishlistItems(prev => prev.filter(item => item.id !== itemId));
  };

  const formatPrice = (price: number) => {
    return price.toLocaleString() + '원';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return '#4CAF50';
      case 'ended':
        return '#FF6B6B';
      case 'closed':
        return '#999999';
      default:
        return '#666666';
    }
  };

  const getStatusText = (status: string, timeLeft: string) => {
    switch (status) {
      case 'active':
        return timeLeft;
      case 'ended':
        return '종료됨';
      case 'closed':
        return '중단됨';
      default:
        return '';
    }
  };

  const renderWishlistItem = ({ item }: { item: WishlistItem }) => (
    <TouchableOpacity
      style={styles.wishlistItem}
      onPress={() => handleItemPress(item)}
    >
      <Card style={styles.wishlistCard}>
        <View style={styles.itemContent}>
          {/* 상품 이미지 */}
          <View style={styles.imageContainer}>
            {item.imageUrl ? (
              <Image source={{ uri: item.imageUrl }} style={styles.itemImage} />
            ) : (
              <View style={styles.imagePlaceholder}>
                <Icon name="image" size={30} color="#CCCCCC" />
              </View>
            )}
          </View>

          {/* 상품 정보 */}
          <View style={styles.itemInfo}>
            <Text style={styles.itemTitle} numberOfLines={2}>
              {item.title}
            </Text>
            
            <View style={styles.priceContainer}>
              <Text style={styles.currentPrice}>{formatPrice(item.currentPrice)}</Text>
              <Text style={styles.startPrice}>시작가: {formatPrice(item.startPrice)}</Text>
            </View>

            <View style={styles.itemMeta}>
              <View style={styles.metaRow}>
                <Icon name="location-on" size={14} color="#666666" />
                <Text style={styles.metaText}>{item.location}</Text>
              </View>
              <View style={styles.metaRow}>
                <Icon name="gavel" size={14} color="#666666" />
                <Text style={styles.metaText}>{item.bidCount}회 입찰</Text>
              </View>
            </View>

            <View style={styles.statusContainer}>
              <View style={[
                styles.statusBadge,
                { backgroundColor: getStatusColor(item.status) }
              ]}>
                <Text style={styles.statusText}>
                  {getStatusText(item.status, item.timeLeft)}
                </Text>
              </View>
            </View>
          </View>

          {/* 삭제 버튼 */}
          <TouchableOpacity
            style={styles.removeButton}
            onPress={() => handleRemoveFromWishlist(item.id)}
          >
            <Icon name="favorite" size={24} color="#FF6B6B" />
          </TouchableOpacity>
        </View>
      </Card>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>찜목록</Text>
        <Text style={styles.itemCount}>{wishlistItems.length}개</Text>
      </View>

      <View style={styles.content}>
        {wishlistItems.length === 0 ? (
          <EmptyState
            icon="favorite-border"
            title="찜한 상품이 없습니다"
            subtitle="관심있는 경매에 하트를 눌러 찜목록에 추가해보세요"
          />
        ) : (
          <FlatList
            data={wishlistItems}
            renderItem={renderWishlistItem}
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
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  itemCount: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  content: {
    flex: 1,
  },
  listContainer: {
    padding: 16,
  },
  wishlistItem: {
    marginBottom: 8,
  },
  wishlistCard: {
    padding: 16,
    backgroundColor: 'white',
  },
  itemContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  imageContainer: {
    marginRight: 12,
  },
  itemImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  imagePlaceholder: {
    width: 80,
    height: 80,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },
  itemInfo: {
    flex: 1,
    justifyContent: 'space-between',
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    lineHeight: 22,
  },
  priceContainer: {
    marginBottom: 8,
  },
  currentPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FF6B6B',
    marginBottom: 2,
  },
  startPrice: {
    fontSize: 12,
    color: '#999',
  },
  itemMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  removeButton: {
    padding: 4,
    marginLeft: 8,
  },
});

export default WishlistScreen;