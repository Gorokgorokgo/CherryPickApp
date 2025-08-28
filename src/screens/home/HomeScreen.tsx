import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  Image,
  TextInput,
  Modal,
  ScrollView,
  StatusBar,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useSafeAreaInsets, SafeAreaView } from 'react-native-safe-area-context';
import { RootStackParamList } from '../../navigation/AppNavigator';
import { Icon } from '../../components/common';

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList>;

interface Auction {
  id: string;
  title: string;
  currentPrice: number;
  startPrice: number;
  imageUrl?: string;
  timeLeft: string;
  location: string;
  bidCount: number;
  category: string;
  likeCount: number;
  isLiked: boolean;
  lastBidTime: string;
}

// 임시 더미 데이터
const DUMMY_AUCTIONS: Auction[] = [
  {
    id: '1',
    title: '갤럭시 버즈 프로 무선 이어폰',
    currentPrice: 100000,
    startPrice: 80000,
    timeLeft: '2시간 15분',
    location: '서울시 강남구',
    bidCount: 12,
    category: '전자제품',
    likeCount: 10,
    isLiked: false,
    lastBidTime: '3분 전',
  },
  {
    id: '2',
    title: '카카오 무료미니 블루투스',
    currentPrice: 50000,
    startPrice: 40000,
    timeLeft: '5시간 42분',
    location: '경기도 성남시',
    bidCount: 7,
    category: '패션',
    likeCount: 15,
    isLiked: true,
    lastBidTime: '7분 전',
  },
  {
    id: '3',
    title: '김치찌개 짜글이 단주면',
    currentPrice: 15000,
    startPrice: 12000,
    timeLeft: '1일 3시간',
    location: '부산시 해운대구',
    bidCount: 23,
    category: '전자제품',
    likeCount: 5,
    isLiked: false,
    lastBidTime: '12분 전',
  },
];

export default function HomeScreen() {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const insets = useSafeAreaInsets();
  const [auctions, setAuctions] = useState<Auction[]>(DUMMY_AUCTIONS);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('전체');
  const [searchText, setSearchText] = useState('');
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [sortBy, setSortBy] = useState<'newest' | 'price_low' | 'price_high' | 'ending_soon'>('newest');
  const [showSortModal, setShowSortModal] = useState(false);

  const categories = ['전체', '전자제품', '패션', '생활용품', '스포츠', '기타'];

  const onRefresh = () => {
    setRefreshing(true);
    // TODO: 실제 API 호출로 데이터 새로고침
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };

  const handleAuctionPress = (auctionId: string) => {
    navigation.navigate('AuctionDetail', { auctionId });
  };

  const handleLikePress = (auctionId: string) => {
    setAuctions(prevAuctions => 
      prevAuctions.map(auction => {
        if (auction.id === auctionId) {
          return {
            ...auction,
            isLiked: !auction.isLiked,
            likeCount: auction.isLiked ? auction.likeCount - 1 : auction.likeCount + 1,
          };
        }
        return auction;
      })
    );
  };

  const handleCreateAuction = () => {
    navigation.navigate('AuctionCreate');
  };

  const formatPrice = (price: number) => {
    return price.toLocaleString() + '원';
  };

  const filteredAuctions = auctions
    .filter(auction => {
      const matchesCategory = selectedCategory === '전체' || auction.category === selectedCategory;
      const matchesSearch = searchText === '' || 
        auction.title.toLowerCase().includes(searchText.toLowerCase()) ||
        auction.location.toLowerCase().includes(searchText.toLowerCase());
      return matchesCategory && matchesSearch;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'price_low':
          return a.currentPrice - b.currentPrice;
        case 'price_high':
          return b.currentPrice - a.currentPrice;
        case 'ending_soon':
          // 시간이 적게 남은 순 (실제로는 timestamp로 정렬해야 함)
          return a.timeLeft.localeCompare(b.timeLeft);
        default:
          return 0; // newest - 실제로는 생성일자로 정렬
      }
    });

  const renderAuctionItem = ({ item }: { item: Auction }) => (
    <TouchableOpacity
      style={styles.auctionCard}
      onPress={() => handleAuctionPress(item.id)}
    >
      <View style={styles.auctionImageContainer}>
        {item.imageUrl ? (
          <Image source={{ uri: item.imageUrl }} style={styles.auctionImage} />
        ) : (
          <View style={styles.imagePlaceholder}>
            <Icon name="image" size={40} color="#CCCCCC" />
          </View>
        )}
        <View style={styles.timeLeftBadge}>
          <Text style={styles.timeLeftText}>{item.timeLeft}</Text>
        </View>
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
          <View style={styles.metaItem}>
            <Icon name="location-on" size={16} color="#666666" />
            <Text style={styles.metaText}>{item.location}</Text>
          </View>
          <View style={styles.metaItem}>
            <Icon name="gavel" size={16} color="#666666" />
            <Text style={styles.metaText}>{item.bidCount}회 입찰</Text>
          </View>
        </View>
        
        <View style={styles.auctionStats}>
          <View style={styles.statItem}>
            <TouchableOpacity 
              style={styles.likeButton}
              onPress={() => handleLikePress(item.id)}
            >
              <Icon 
                name={item.isLiked ? "favorite" : "favorite-border"} 
                size={16} 
                color={item.isLiked ? "#FF6B6B" : "#666666"} 
              />
              <Text style={[styles.statText, item.isLiked && styles.likedText]}>
                {item.likeCount}
              </Text>
            </TouchableOpacity>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.lastBidText}>최근 입찰 {item.lastBidTime}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderCategoryButton = (category: string) => (
    <TouchableOpacity
      key={category}
      style={[
        styles.categoryButton,
        selectedCategory === category && styles.categoryButtonActive,
      ]}
      onPress={() => setSelectedCategory(category)}
    >
      <Text
        style={[
          styles.categoryButtonText,
          selectedCategory === category && styles.categoryButtonTextActive,
        ]}
      >
        {category}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>체리픽</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity 
            style={styles.headerButton}
            onPress={() => setShowSearchModal(true)}
          >
            <Icon name="search" size={24} color="#333333" />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.headerButton}
            onPress={() => setShowSortModal(true)}
          >
            <Icon name="filter-list" size={24} color="#333333" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerButton}>
            <Icon name="notifications" size={24} color="#333333" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.categoriesContainer}>
        <FlatList
          data={categories}
          renderItem={({ item }) => renderCategoryButton(item)}
          keyExtractor={(item) => item}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesList}
        />
      </View>

      <FlatList
        data={filteredAuctions}
        renderItem={renderAuctionItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.auctionsList}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      />

      {/* 검색 모달 */}
      <Modal
        visible={showSearchModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowSearchModal(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowSearchModal(false)}>
              <Icon name="close" size={24} color="#333333" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>검색</Text>
            <View style={{ width: 24 }} />
          </View>
          
          <View style={styles.searchContainer}>
            <TextInput
              style={styles.searchInput}
              placeholder="상품명, 지역으로 검색해보세요"
              value={searchText}
              onChangeText={setSearchText}
              autoFocus
            />
            <TouchableOpacity 
              style={styles.searchButton}
              onPress={() => setShowSearchModal(false)}
            >
              <Text style={styles.searchButtonText}>검색</Text>
            </TouchableOpacity>
          </View>
          
          {searchText !== '' && (
            <View style={styles.searchResults}>
              <Text style={styles.searchResultsTitle}>
                '{searchText}' 검색 결과 ({filteredAuctions.length}개)
              </Text>
            </View>
          )}
        </SafeAreaView>
      </Modal>

      {/* 정렬 모달 */}
      <Modal
        visible={showSortModal}
        animationType="fade"
        transparent
        onRequestClose={() => setShowSortModal(false)}
      >
        <View style={styles.sortModalOverlay}>
          <View style={styles.sortModalContent}>
            <Text style={styles.sortModalTitle}>정렬 기준</Text>
            
            {[
              { key: 'newest', label: '최신순' },
              { key: 'ending_soon', label: '마감임박순' },
              { key: 'price_low', label: '낮은 가격순' },
              { key: 'price_high', label: '높은 가격순' },
            ].map(option => (
              <TouchableOpacity
                key={option.key}
                style={styles.sortOption}
                onPress={() => {
                  setSortBy(option.key as any);
                  setShowSortModal(false);
                }}
              >
                <Text style={[
                  styles.sortOptionText,
                  sortBy === option.key && styles.sortOptionTextSelected
                ]}>
                  {option.label}
                </Text>
                {sortBy === option.key && (
                  <Icon name="check" size={20} color="#FF6B6B" />
                )}
              </TouchableOpacity>
            ))}
            
            <TouchableOpacity
              style={styles.sortCancelButton}
              onPress={() => setShowSortModal(false)}
            >
              <Text style={styles.sortCancelText}>취소</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* 경매 등록 플로팅 버튼 */}
      <TouchableOpacity
        style={styles.floatingButton}
        onPress={handleCreateAuction}
        activeOpacity={0.8}
      >
        <Icon name="add" size={28} color="#FFFFFF" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FF6B6B',
  },
  headerActions: {
    flexDirection: 'row',
  },
  headerButton: {
    marginLeft: 16,
    padding: 4,
  },
  categoriesContainer: {
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  categoriesList: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 12,
    borderRadius: 20,
    backgroundColor: '#F8F8F8',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  categoryButtonActive: {
    backgroundColor: '#FF6B6B',
    borderColor: '#FF6B6B',
  },
  categoryButtonText: {
    fontSize: 14,
    color: '#666666',
    fontWeight: '500',
  },
  categoryButtonTextActive: {
    color: '#FFFFFF',
  },
  auctionsList: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
  },
  auctionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 16,
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
    position: 'relative',
  },
  auctionImage: {
    width: '100%',
    height: 200,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  imagePlaceholder: {
    width: '100%',
    height: 200,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  timeLeftBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  timeLeftText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  auctionInfo: {
    padding: 16,
  },
  auctionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 12,
    lineHeight: 22,
  },
  priceContainer: {
    marginBottom: 12,
  },
  currentPrice: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FF6B6B',
    marginBottom: 4,
  },
  startPrice: {
    fontSize: 14,
    color: '#999999',
  },
  auctionMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaText: {
    fontSize: 12,
    color: '#666666',
    marginLeft: 4,
  },
  // 검색 모달 스타일
  modalContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
  },
  searchContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    alignItems: 'center',
  },
  searchInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    marginRight: 12,
  },
  searchButton: {
    backgroundColor: '#FF6B6B',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  searchButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  searchResults: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  searchResultsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
  },
  // 정렬 모달 스타일
  sortModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  sortModalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 20,
    paddingBottom: 40,
  },
  sortModalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
    textAlign: 'center',
    marginBottom: 20,
  },
  sortOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  sortOptionText: {
    fontSize: 16,
    color: '#333333',
  },
  sortOptionTextSelected: {
    color: '#FF6B6B',
    fontWeight: '600',
  },
  sortCancelButton: {
    marginTop: 16,
    marginHorizontal: 24,
    paddingVertical: 4,
    paddingTop:20,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  sortCancelText: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
  },
  // 플로팅 버튼 스타일
  floatingButton: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FF6B6B',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  // 경매 통계 스타일
  auctionStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  likeButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statText: {
    fontSize: 12,
    color: '#666666',
    marginLeft: 4,
    fontWeight: '500',
  },
  likedText: {
    color: '#FF6B6B',
  },
  lastBidText: {
    fontSize: 11,
    color: '#999999',
  },
});