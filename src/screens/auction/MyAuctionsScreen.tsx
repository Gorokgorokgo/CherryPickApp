import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../navigation/AppNavigator';
import { Icon } from '../../components/common';

type MyAuctionsScreenNavigationProp = StackNavigationProp<RootStackParamList>;

interface MyAuction {
  id: string;
  title: string;
  currentPrice: number;
  startPrice: number;
  imageUrl?: string;
  status: 'active' | 'ended' | 'bidding';
  timeLeft?: string;
  type: 'selling' | 'bidding';
  isWinning?: boolean;
}

// 임시 더미 데이터
const DUMMY_AUCTIONS: MyAuction[] = [
  {
    id: '1',
    title: '맥북 프로 13인치 M1',
    currentPrice: 1200000,
    startPrice: 900000,
    status: 'active',
    timeLeft: '1일 5시간',
    type: 'selling',
  },
  {
    id: '2',
    title: '아이폰 14 Pro 256GB',
    currentPrice: 850000,
    startPrice: 500000,
    status: 'bidding',
    timeLeft: '2시간 15분',
    type: 'bidding',
    isWinning: true,
  },
  {
    id: '3',
    title: '나이키 운동화 270mm',
    currentPrice: 95000,
    startPrice: 50000,
    status: 'ended',
    type: 'selling',
  },
  {
    id: '4',
    title: '삼성 갤럭시 S23',
    currentPrice: 650000,
    startPrice: 400000,
    status: 'bidding',
    timeLeft: '5시간',
    type: 'bidding',
    isWinning: false,
  },
];

export default function MyAuctionsScreen() {
  const navigation = useNavigation<MyAuctionsScreenNavigationProp>();
  const [selectedTab, setSelectedTab] = useState<'selling' | 'bidding'>('selling');
  
  const formatPrice = (price: number) => {
    return price.toLocaleString() + '원';
  };

  const getStatusText = (auction: MyAuction) => {
    if (auction.type === 'selling') {
      switch (auction.status) {
        case 'active':
          return '진행중';
        case 'ended':
          return '종료';
        default:
          return '';
      }
    } else {
      switch (auction.status) {
        case 'bidding':
          return auction.isWinning ? '최고가 입찰중' : '입찰중';
        case 'ended':
          return auction.isWinning ? '낙찰' : '유찰';
        default:
          return '';
      }
    }
  };

  const getStatusColor = (auction: MyAuction) => {
    if (auction.type === 'selling') {
      return auction.status === 'active' ? '#4CAF50' : '#999999';
    } else {
      if (auction.status === 'ended') {
        return auction.isWinning ? '#FF6B6B' : '#999999';
      }
      return auction.isWinning ? '#FF6B6B' : '#4CAF50';
    }
  };

  const handleAuctionPress = (auctionId: string) => {
    navigation.navigate('AuctionDetail', { auctionId });
  };

  const filteredAuctions = DUMMY_AUCTIONS.filter(auction => auction.type === selectedTab);

  const renderAuctionItem = ({ item }: { item: MyAuction }) => (
    <TouchableOpacity
      style={styles.auctionCard}
      onPress={() => handleAuctionPress(item.id)}
    >
      <View style={styles.auctionImageContainer}>
        {item.imageUrl ? (
          <Image source={{ uri: item.imageUrl }} style={styles.auctionImage} />
        ) : (
          <View style={styles.imagePlaceholder}>
            <Icon name="image" size={30} color="#CCCCCC" />
          </View>
        )}
      </View>
      
      <View style={styles.auctionInfo}>
        <Text style={styles.auctionTitle} numberOfLines={2}>
          {item.title}
        </Text>
        
        <View style={styles.priceContainer}>
          <Text style={styles.currentPrice}>{formatPrice(item.currentPrice)}</Text>
          <Text style={styles.startPrice}>시작가: {formatPrice(item.startPrice)}</Text>
        </View>
        
        <View style={styles.auctionMeta}>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item) }]}>
            <Text style={styles.statusText}>{getStatusText(item)}</Text>
          </View>
          {item.timeLeft && (
            <Text style={styles.timeLeft}>{item.timeLeft} 남음</Text>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Icon 
        name={selectedTab === 'selling' ? 'store' : 'gavel'} 
        size={64} 
        color="#CCCCCC" 
      />
      <Text style={styles.emptyTitle}>
        {selectedTab === 'selling' ? '등록한 경매가 없습니다' : '입찰한 경매가 없습니다'}
      </Text>
      <Text style={styles.emptySubtitle}>
        {selectedTab === 'selling' 
          ? '첫 번째 경매를 등록해보세요!' 
          : '관심있는 경매에 입찰해보세요!'}
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>내 경매</Text>
      </View>

      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[
            styles.tabButton,
            selectedTab === 'selling' && styles.tabButtonActive,
          ]}
          onPress={() => setSelectedTab('selling')}
        >
          <Text
            style={[
              styles.tabButtonText,
              selectedTab === 'selling' && styles.tabButtonTextActive,
            ]}
          >
            판매 중
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.tabButton,
            selectedTab === 'bidding' && styles.tabButtonActive,
          ]}
          onPress={() => setSelectedTab('bidding')}
        >
          <Text
            style={[
              styles.tabButtonText,
              selectedTab === 'bidding' && styles.tabButtonTextActive,
            ]}
          >
            입찰 중
          </Text>
        </TouchableOpacity>
      </View>

      {filteredAuctions.length > 0 ? (
        <FlatList
          data={filteredAuctions}
          renderItem={renderAuctionItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.auctionsList}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        renderEmptyState()
      )}

      {selectedTab === 'selling' && (
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => navigation.navigate('AuctionCreate')}
        >
          <Icon name="add" size={24} color="#FFFFFF" />
          <Text style={styles.addButtonText}>경매 등록</Text>
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333333',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#F8F8F8',
    margin: 20,
    borderRadius: 8,
    padding: 4,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 6,
  },
  tabButtonActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  tabButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#666666',
  },
  tabButtonTextActive: {
    color: '#333333',
    fontWeight: '600',
  },
  auctionsList: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  auctionCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  auctionImageContainer: {
    marginRight: 16,
  },
  auctionImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  imagePlaceholder: {
    width: 80,
    height: 80,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },
  auctionInfo: {
    flex: 1,
    justifyContent: 'space-between',
  },
  auctionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
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
    color: '#999999',
  },
  auctionMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
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
  timeLeft: {
    fontSize: 12,
    color: '#666666',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
  },
  addButton: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    backgroundColor: '#FF6B6B',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
  },
});