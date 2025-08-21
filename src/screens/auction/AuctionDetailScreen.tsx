import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
  TextInput,
} from 'react-native';
import { useRoute, RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../../navigation/AppNavigator';
import Icon from 'react-native-vector-icons/MaterialIcons';

type AuctionDetailRouteProp = RouteProp<RootStackParamList, 'AuctionDetail'>;

interface AuctionDetail {
  id: string;
  title: string;
  description: string;
  currentPrice: number;
  startPrice: number;
  images: string[];
  timeLeft: string;
  location: string;
  bidCount: number;
  category: string;
  sellerName: string;
  sellerRating: number;
  condition: string;
  minimumBidIncrement: number;
}

interface Bid {
  id: string;
  amount: number;
  bidderName: string;
  timestamp: string;
}

// 임시 더미 데이터
const DUMMY_AUCTION: AuctionDetail = {
  id: '1',
  title: '아이폰 14 Pro 256GB (상태 좋음)',
  description: `아이폰 14 Pro 256GB 딥 퍼플 색상입니다.
  
• 구매일: 2023년 3월
• 사용 기간: 약 10개월
• 외관 상태: 매우 좋음 (스크래치 없음)
• 배터리 최대 용량: 94%
• 구성품: 본체, 충전기, 이어폰 (미사용), 박스

액정보호필름과 케이스를 착용하여 사용했기 때문에 외관 상태가 매우 좋습니다.
기능적으로도 전혀 문제없이 작동합니다.`,
  currentPrice: 850000,
  startPrice: 500000,
  images: [],
  timeLeft: '2시간 15분',
  location: '서울시 강남구',
  bidCount: 12,
  category: '전자제품',
  sellerName: '체리픽러123',
  sellerRating: 4.8,
  condition: '상급',
  minimumBidIncrement: 10000,
};

const DUMMY_BIDS: Bid[] = [
  {
    id: '1',
    amount: 850000,
    bidderName: '입찰자***',
    timestamp: '2분 전',
  },
  {
    id: '2',
    amount: 820000,
    bidderName: '경매왕***',
    timestamp: '15분 전',
  },
  {
    id: '3',
    amount: 800000,
    bidderName: '체리***',
    timestamp: '32분 전',
  },
];

export default function AuctionDetailScreen() {
  const route = useRoute<AuctionDetailRouteProp>();
  const { auctionId } = route.params;
  
  const [auction] = useState<AuctionDetail>(DUMMY_AUCTION);
  const [bids] = useState<Bid[]>(DUMMY_BIDS);
  const [bidAmount, setBidAmount] = useState('');
  const [loading, setLoading] = useState(false);

  const formatPrice = (price: number) => {
    return price.toLocaleString() + '원';
  };

  const handleBidPress = () => {
    const amount = parseInt(bidAmount.replace(/,/g, ''));
    
    if (!amount) {
      Alert.alert('오류', '입찰 금액을 입력해주세요.');
      return;
    }

    if (amount <= auction.currentPrice) {
      Alert.alert('오류', `현재 최고가(${formatPrice(auction.currentPrice)})보다 높은 금액을 입력해주세요.`);
      return;
    }

    if (amount < auction.currentPrice + auction.minimumBidIncrement) {
      Alert.alert('오류', `최소 입찰 단위는 ${formatPrice(auction.minimumBidIncrement)}원입니다.`);
      return;
    }

    Alert.alert(
      '입찰 확인',
      `${formatPrice(amount)}에 입찰하시겠습니까?\n\n※ 입찰 후에는 취소할 수 없습니다.`,
      [
        { text: '취소', style: 'cancel' },
        { 
          text: '입찰', 
          onPress: () => {
            setLoading(true);
            // TODO: 실제 입찰 API 호출
            setTimeout(() => {
              setLoading(false);
              setBidAmount('');
              Alert.alert('성공', '입찰이 완료되었습니다.');
            }, 1000);
          }
        },
      ]
    );
  };

  const handleQuickBid = (increment: number) => {
    const newAmount = auction.currentPrice + increment;
    setBidAmount(newAmount.toLocaleString());
  };

  const renderStarRating = (rating: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Icon
          key={i}
          name={i <= rating ? 'star' : 'star-border'}
          size={16}
          color="#FFD700"
        />
      );
    }
    return <View style={styles.starContainer}>{stars}</View>;
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* 이미지 영역 */}
        <View style={styles.imageContainer}>
          <View style={styles.imagePlaceholder}>
            <Icon name="image" size={60} color="#CCCCCC" />
          </View>
          <View style={styles.timeLeftBadge}>
            <Text style={styles.timeLeftText}>{auction.timeLeft}</Text>
          </View>
        </View>

        {/* 기본 정보 */}
        <View style={styles.infoSection}>
          <Text style={styles.title}>{auction.title}</Text>
          
          <View style={styles.priceContainer}>
            <Text style={styles.currentPrice}>현재가 {formatPrice(auction.currentPrice)}</Text>
            <Text style={styles.startPrice}>시작가: {formatPrice(auction.startPrice)}</Text>
          </View>

          <View style={styles.metaContainer}>
            <View style={styles.metaRow}>
              <Icon name="location-on" size={16} color="#666666" />
              <Text style={styles.metaText}>{auction.location}</Text>
            </View>
            <View style={styles.metaRow}>
              <Icon name="gavel" size={16} color="#666666" />
              <Text style={styles.metaText}>{auction.bidCount}회 입찰</Text>
            </View>
            <View style={styles.metaRow}>
              <Icon name="category" size={16} color="#666666" />
              <Text style={styles.metaText}>{auction.category}</Text>
            </View>
          </View>
        </View>

        {/* 판매자 정보 */}
        <View style={styles.sellerSection}>
          <Text style={styles.sectionTitle}>판매자 정보</Text>
          <View style={styles.sellerInfo}>
            <Text style={styles.sellerName}>{auction.sellerName}</Text>
            <View style={styles.sellerRating}>
              {renderStarRating(auction.sellerRating)}
              <Text style={styles.ratingText}>({auction.sellerRating})</Text>
            </View>
          </View>
        </View>

        {/* 상품 설명 */}
        <View style={styles.descriptionSection}>
          <Text style={styles.sectionTitle}>상품 설명</Text>
          <Text style={styles.description}>{auction.description}</Text>
        </View>

        {/* 입찰 내역 */}
        <View style={styles.bidsSection}>
          <Text style={styles.sectionTitle}>입찰 내역</Text>
          {bids.map((bid) => (
            <View key={bid.id} style={styles.bidItem}>
              <View style={styles.bidInfo}>
                <Text style={styles.bidAmount}>{formatPrice(bid.amount)}</Text>
                <Text style={styles.bidder}>{bid.bidderName}</Text>
              </View>
              <Text style={styles.bidTime}>{bid.timestamp}</Text>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* 입찰 영역 */}
      <View style={styles.bidSection}>
        <View style={styles.bidInputContainer}>
          <TextInput
            style={styles.bidInput}
            placeholder={`최소 ${formatPrice(auction.currentPrice + auction.minimumBidIncrement)}`}
            value={bidAmount}
            onChangeText={setBidAmount}
            keyboardType="numeric"
          />
          <TouchableOpacity
            style={styles.bidButton}
            onPress={handleBidPress}
            disabled={loading}
          >
            <Text style={styles.bidButtonText}>
              {loading ? '입찰 중...' : '입찰하기'}
            </Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.quickBidContainer}>
          <TouchableOpacity
            style={styles.quickBidButton}
            onPress={() => handleQuickBid(auction.minimumBidIncrement)}
          >
            <Text style={styles.quickBidText}>+{formatPrice(auction.minimumBidIncrement)}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.quickBidButton}
            onPress={() => handleQuickBid(50000)}
          >
            <Text style={styles.quickBidText}>+50,000원</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.quickBidButton}
            onPress={() => handleQuickBid(100000)}
          >
            <Text style={styles.quickBidText}>+100,000원</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 16,
  },
  imageContainer: {
    position: 'relative',
  },
  imagePlaceholder: {
    width: '100%',
    height: 250,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  timeLeftBadge: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  timeLeftText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  infoSection: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 16,
    lineHeight: 28,
  },
  priceContainer: {
    marginBottom: 16,
  },
  currentPrice: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FF6B6B',
    marginBottom: 4,
  },
  startPrice: {
    fontSize: 16,
    color: '#999999',
  },
  metaContainer: {
    gap: 8,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaText: {
    fontSize: 14,
    color: '#666666',
    marginLeft: 8,
  },
  sellerSection: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 12,
  },
  sellerInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sellerName: {
    fontSize: 16,
    color: '#333333',
  },
  sellerRating: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  starContainer: {
    flexDirection: 'row',
    marginRight: 8,
  },
  ratingText: {
    fontSize: 14,
    color: '#666666',
  },
  descriptionSection: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  description: {
    fontSize: 16,
    color: '#333333',
    lineHeight: 24,
  },
  bidsSection: {
    padding: 20,
  },
  bidItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F8F8F8',
  },
  bidInfo: {},
  bidAmount: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 4,
  },
  bidder: {
    fontSize: 14,
    color: '#666666',
  },
  bidTime: {
    fontSize: 12,
    color: '#999999',
  },
  bidSection: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    backgroundColor: '#FFFFFF',
  },
  bidInputContainer: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  bidInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    marginRight: 12,
  },
  bidButton: {
    backgroundColor: '#FF6B6B',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    justifyContent: 'center',
  },
  bidButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  quickBidContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  quickBidButton: {
    flex: 1,
    backgroundColor: '#F8F8F8',
    paddingVertical: 10,
    marginHorizontal: 4,
    borderRadius: 6,
    alignItems: 'center',
  },
  quickBidText: {
    fontSize: 14,
    color: '#666666',
    fontWeight: '500',
  },
});