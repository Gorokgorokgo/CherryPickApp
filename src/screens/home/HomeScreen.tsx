import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  RefreshControl,
  Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../navigation/AppNavigator';
import Icon from 'react-native-vector-icons/MaterialIcons';

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
}

// 임시 더미 데이터
const DUMMY_AUCTIONS: Auction[] = [
  {
    id: '1',
    title: '아이폰 14 Pro 256GB (상태 좋음)',
    currentPrice: 850000,
    startPrice: 500000,
    timeLeft: '2시간 15분',
    location: '서울시 강남구',
    bidCount: 12,
    category: '전자제품',
  },
  {
    id: '2',
    title: '나이키 에어포스 270mm 새상품',
    currentPrice: 95000,
    startPrice: 50000,
    timeLeft: '5시간 42분',
    location: '경기도 성남시',
    bidCount: 7,
    category: '패션',
  },
  {
    id: '3',
    title: '맥북 프로 M2 13인치 (2022)',
    currentPrice: 1450000,
    startPrice: 1200000,
    timeLeft: '1일 3시간',
    location: '부산시 해운대구',
    bidCount: 23,
    category: '전자제품',
  },
  {
    id: '4',
    title: '루이비통 가방 정품 (인증서 포함)',
    currentPrice: 320000,
    startPrice: 200000,
    timeLeft: '12시간 18분',
    location: '서울시 송파구',
    bidCount: 15,
    category: '패션',
  },
];

export default function HomeScreen() {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const [auctions, setAuctions] = useState<Auction[]>(DUMMY_AUCTIONS);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('전체');

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

  const formatPrice = (price: number) => {
    return price.toLocaleString() + '원';
  };

  const filteredAuctions = selectedCategory === '전체' 
    ? auctions 
    : auctions.filter(auction => auction.category === selectedCategory);

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
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>체리픽</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.headerButton}>
            <Icon name="search" size={24} color="#333333" />
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
    </SafeAreaView>
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
});