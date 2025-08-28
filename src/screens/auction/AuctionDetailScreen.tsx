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
  Dimensions,
  FlatList,
} from 'react-native';
import { useRoute, RouteProp, useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { RootStackParamList } from '../../navigation/AppNavigator';
import { Icon } from '../../components/common';

type AuctionDetailRouteProp = RouteProp<RootStackParamList, 'AuctionDetail'>;

interface AuctionDetail {
  id: string;
  title: string;
  description: string;
  currentPrice: number;
  startPrice: number;
  buyNowPrice?: number;
  images: string[];
  timeLeft: string;
  location: string;
  bidCount: number;
  category: string;
  sellerName: string;
  sellerRating: number;
  sellerLevel: string;
  condition: number; // 1-10 점수
  purchaseDate: string;
  duration: string;
  minimumBidIncrement: number;
}

interface QnAItem {
  id: string;
  type: 'question' | 'answer';
  author: string;
  content: string;
  timestamp: string;
  authorLevel?: string;
  relatedQuestionId?: string; // 답변의 경우 관련된 질문 ID
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
  title: '아이폰 14 Pro 256GB 스페이스블랙',
  description: `아이폰 14 Pro 256GB 딥 퍼플 색상입니다. 보호필름과 케이스를 착용하여 사용했기 때문에 외관 상태가 매우 좋습니다. 기능적으로도 전혀 문제없이 작동합니다.

두 달 동안 사용했습니다. 박스, 충전 케이블이 제공됩니다. 탁훈 테크를 확인해보세요.`,
  currentPrice: 580000,
  startPrice: 500000,
  buyNowPrice: undefined,
  images: [
    'https://via.placeholder.com/400x300/FF6B6B/FFFFFF?text=iPhone+14+Pro+1',
    'https://via.placeholder.com/400x300/4ECDC4/FFFFFF?text=iPhone+14+Pro+2',
    'https://via.placeholder.com/400x300/45B7D1/FFFFFF?text=iPhone+14+Pro+3',
  ],
  timeLeft: '14:32:15',
  location: '서울시 강남구',
  bidCount: 5,
  category: '전자제품',
  sellerName: '홍길동',
  sellerLevel: '판 매력 Lv12',
  sellerRating: 4.9,
  condition: 9,
  purchaseDate: '2023년 3월 15일 구매 (약 10개월 전)',
  duration: '24시간',
  minimumBidIncrement: 10000,
};

const DUMMY_QNA: QnAItem[] = [
  {
    id: '1',
    type: 'question',
    author: '아이폰구매자',
    authorLevel: '브론즈베이스트',
    content: '배터리 상태가 94%라고 하셨는데, 실제 사용 시간은 어느 정도인가요?',
    timestamp: '2025.07.30 14:05'
  },
  {
    id: '2', 
    type: 'answer',
    author: '홍길동',
    authorLevel: '판매왕베이스트',
    content: '하루 종일 사용해도 저녁까지는 충분히 지속됩니다. 게임이나 동영상을 많이 보지 않는 일반적인 사용 기준으로 말씀드려요.',
    timestamp: '2025.07.30 14:15',
    relatedQuestionId: '1'
  },
  {
    id: '3',
    type: 'question', 
    author: '관심있어요',
    content: '케이스와 보호필름 제거 후 실제 상태 사진도 볼 수 있을까요? 특히 모서리 부분이 궁금해요.',
    timestamp: '2025.07.30 15:20'
  },
  {
    id: '4',
    type: 'answer',
    author: '홍길동',
    authorLevel: '판매왕베이스트', 
    content: '네, 저녁에 케이스 벗긴 상태로 추가 사진 올려드릴게요. 모서리도 깨끗한 상태입니다.',
    timestamp: '2025.07.30 15:35',
    relatedQuestionId: '3'
  },
  {
    id: '5',
    type: 'question',
    author: '폰바꾸고싶어',
    content: '직거래 가능한가요? 강남 쪽에서 만날 수 있나요?',
    timestamp: '2025.07.30 16:10'
  },
  {
    id: '6',
    type: 'answer',
    author: '홍길동',
    authorLevel: '판매왕베이스트',
    content: '강남역 근처에서 직거래 가능합니다. 낙찰되시면 따로 연락드려서 약속 잡겠습니다.',
    timestamp: '2025.07.30 16:22',
    relatedQuestionId: '5'
  }
];

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

const { width } = Dimensions.get('window');

export default function AuctionDetailScreen() {
  const route = useRoute<AuctionDetailRouteProp>();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { auctionId } = route.params;

  const [auction] = useState<AuctionDetail>(DUMMY_AUCTION);
  const [bids] = useState<Bid[]>(DUMMY_BIDS);
  const [bidAmount, setBidAmount] = useState('');
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [qnaList, setQnaList] = useState<QnAItem[]>(
    DUMMY_QNA.sort((a, b) => {
      // timestamp 기준으로 최신 순 정렬 (내림차순)
      return new Date(b.timestamp.replace(/\./g, '-')).getTime() - new Date(a.timestamp.replace(/\./g, '-')).getTime();
    })
  );
  const [questionText, setQuestionText] = useState('');

  const formatPrice = (price: number) => {
    return price.toLocaleString() + '원';
  };

  const handleBid = () => {
    const amount = parseInt(bidAmount.replace(/,/g, ''));
    if (!amount) {
      Alert.alert('알림', '입찰 금액을 입력해주세요.');
      return;
    }
    if (amount <= auction.currentPrice) {
      Alert.alert('알림', `현재 입찰가보다 높은 금액을 입력해주세요.`);
      return;
    }
    if (amount < auction.currentPrice + auction.minimumBidIncrement) {
      Alert.alert('알림', `최소 ${formatPrice(auction.currentPrice + auction.minimumBidIncrement)} 이상 입찰해주세요.`);
      return;
    }

    Alert.alert(
      '입찰 확인',
      `${formatPrice(amount)}에 입찰하시겠습니까?`,
      [
        { text: '취소', style: 'cancel' },
        { text: '입찰', onPress: () => {
          // TODO: 입찰 API 호출
          Alert.alert('성공', '입찰이 완료되었습니다.');
          setBidAmount('');
        }}
      ]
    );
  };

  const handleBuyNow = () => {
    if (!auction.buyNowPrice) return;
    
    Alert.alert(
      '즉시구매 확인',
      `${formatPrice(auction.buyNowPrice)}에 즉시구매하시겠습니까?`,
      [
        { text: '취소', style: 'cancel' },
        { text: '구매', onPress: () => {
          // TODO: 즉시구매 API 호출
          Alert.alert('성공', '즉시구매가 완료되었습니다.');
        }}
      ]
    );
  };

  const handleLikePress = () => {
    setIsLiked(!isLiked);
    // TODO: 좋아요 API 호출
  };

  const handleSharePress = () => {
    // TODO: 공유 기능 구현
    Alert.alert('공유', '경매 상품을 공유합니다.');
  };

  const handleQuestionSubmit = () => {
    if (!questionText.trim()) {
      Alert.alert('알림', '질문을 입력해주세요.');
      return;
    }

    const newQuestion: QnAItem = {
      id: `qna_${Date.now()}`,
      type: 'question',
      author: '나',
      content: questionText.trim(),
      timestamp: new Date().toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      }).replace(/\. /g, '.').replace(/:/g, ':')
    };

    setQnaList(prev => [newQuestion, ...prev]);
    setQuestionText('');
    
    // TODO: 실제 API 호출
    Alert.alert('등록 완료', '질문이 등록되었습니다.');
  };

  const renderStarRating = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Icon
          key={i}
          name={i <= fullStars ? 'star' : 'star-border'}
          size={14}
          color="#FFD700"
        />
      );
    }
    return <View style={styles.starContainer}>{stars}</View>;
  };

  const renderConditionDots = (condition: number) => {
    return (
      <View style={styles.conditionContainer}>
        <Text style={styles.conditionLabel}>1</Text>
        <View style={styles.conditionDotsContainer}>
          {Array.from({ length: 10 }, (_, i) => i + 1).map((value) => (
            <View
              key={value}
              style={[
                styles.conditionDot,
                condition >= value && styles.conditionDotActive
              ]}
            />
          ))}
        </View>
        <Text style={styles.conditionLabel}>10</Text>
        <View style={styles.conditionValueContainer}>
          <View style={styles.conditionValueCircle}>
            <Text style={styles.conditionValue}>{condition}</Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* 헤더 */}
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color="#333333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>경매 상세</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity 
            style={styles.headerActionButton}
            onPress={handleLikePress}
          >
            <Icon 
              name={isLiked ? 'favorite' : 'favorite-border'} 
              size={24} 
              color={isLiked ? '#FF6B6B' : '#333333'} 
            />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.headerActionButton}
            onPress={handleSharePress}
          >
            <Icon 
              name="share" 
              size={24} 
              color="#333333" 
            />
          </TouchableOpacity>
        </View>
      </View>
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* 이미지 섹션 */}
        <View style={styles.imageSection}>
          <View style={styles.imageContainer}>
            <View style={styles.imagePlaceholder}>
              <Icon name="image" size={60} color="#CCCCCC" />
            </View>
            <View style={styles.timeLeftBadge}>
              <Text style={styles.timeLeftText}>{auction.timeLeft} 남음</Text>
            </View>
          </View>
        </View>

        {/* 판매자 정보 */}
        <View style={styles.sellerProfileSection}>
          <View style={styles.leftSection}>
            <View style={styles.profileIcon}>
              <Icon name="person" size={24} color="#999999" />
            </View>
            <View style={styles.sellerBasicInfo}>
              <Text style={styles.sellerName}>{auction.sellerName}</Text>
              <Text style={styles.sellerLocation}>서울 강남구 서초동</Text>
            </View>
          </View>
          <View style={styles.rightSection}>
            <View style={styles.sellerLevelBadge}>
              <Text style={styles.sellerLevelText}>{auction.sellerLevel}</Text>
            </View>
            <View style={styles.sellerRating}>
              <Text style={styles.sellerRatingLabel}>경매왕</Text>
              <Icon name="star" size={14} color="#FFD700" />
              <Text style={styles.ratingText}>{auction.sellerRating} ({Math.floor(auction.sellerRating * 50)}개 후기)</Text>
            </View>
          </View>
        </View>

        {/* 제목 및 기본 정보 */}
        <View style={styles.section}>
          <Text style={styles.title}>{auction.title}</Text>
          
          <View style={styles.priceContainer}>
            <Text style={styles.currentPrice}>{formatPrice(auction.currentPrice)}</Text>
            <Text style={styles.startPrice}>시작가: {formatPrice(auction.startPrice)}</Text>
            {auction.buyNowPrice && (
              <Text style={styles.buyNowPrice}>희망가: {formatPrice(auction.buyNowPrice)}</Text>
            )}
          </View>

          <View style={styles.metaContainer}>
            <View style={styles.metaRow}>
              <Icon name="category" size={16} color="#666666" />
              <Text style={styles.metaText}>{auction.category}</Text>
            </View>
            <View style={styles.metaRow}>
              <Icon name="location-on" size={16} color="#666666" />
              <Text style={styles.metaText}>{auction.location}</Text>
            </View>
            <View style={styles.metaRow}>
              <Icon name="gavel" size={16} color="#666666" />
              <Text style={styles.metaText}>{auction.bidCount}회 입찰</Text>
            </View>
          </View>
        </View>

        {/* 구매일 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>구매일</Text>
          <Text style={styles.purchaseDate}>{auction.purchaseDate}</Text>
        </View>

        {/* 상태 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>상태 (1~10)</Text>
          <Text style={styles.conditionDescription}>상품 품질을 나타냅니다</Text>
          {renderConditionDots(auction.condition)}
        </View>


        {/* 상품 설명 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>상품 설명</Text>
          <Text style={styles.description}>{auction.description}</Text>
        </View>

        {/* 입찰 내역 */}
        <View style={styles.section}>
          <View style={styles.bidHeaderContainer}>
            <Text style={styles.sectionTitle}>입찰 내역</Text>
            <Text style={styles.bidCount}>총 {bids.length}명</Text>
          </View>
          {bids.map((bid, index) => (
            <View key={bid.id} style={[styles.bidItem, index === 0 && styles.topBid]}>
              <View style={styles.bidInfo}>
                <Text style={[styles.bidAmount, index === 0 && styles.topBidAmount]}>
                  {formatPrice(bid.amount)}
                </Text>
                <Text style={styles.bidder}>{bid.bidderName}</Text>
              </View>
              <Text style={styles.bidTime}>{bid.timestamp}</Text>
            </View>
          ))}
        </View>

        {/* Q&A 섹션 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Q&A (질문과 답변)</Text>
          
          {/* 질문 입력칸 */}
          <View style={styles.questionInputContainer}>
            <TextInput
              style={styles.questionInput}
              placeholder="댓글을 입력하세요"
              multiline={true}
              numberOfLines={2}
              textAlignVertical="top"
              value={questionText}
              onChangeText={setQuestionText}
            />
            <TouchableOpacity 
              style={styles.questionSubmitButton}
              onPress={handleQuestionSubmit}
            >
              <Text style={styles.questionSubmitText}>등록</Text>
            </TouchableOpacity>
          </View>
          {qnaList.map((item, index) => {
            const prevItem = index > 0 ? qnaList[index - 1] : null;
            const isReply = item.type === 'answer' && prevItem && prevItem.type === 'question';
            
            return (
              <View key={item.id} style={[
                styles.chatMessage,
                item.type === 'question' ? styles.questionMessage : styles.answerMessage,
                isReply && styles.replyMessage
              ]}>
                <View style={styles.messageWrapper}>
                  {/* 답장 표시 */}
                  {isReply && (
                    <View style={[
                      styles.replyIndicator,
                      item.type === 'answer' ? styles.answerReplyIndicator : styles.questionReplyIndicator
                    ]}>
                      <Icon name="arrow-back" size={12} color="#999999" />
                      <Text style={styles.replyText}>
                        {prevItem?.author}님에게 답장: {prevItem?.content.length > 15 ? `${prevItem?.content.substring(0, 15)}...` : prevItem?.content}
                      </Text>
                    </View>
                  )}
                  
                  {/* 작성자 정보를 말풍선 밖에 표시 */}
                  <View style={[
                    styles.authorContainer,
                    item.type === 'question' ? styles.questionAuthorContainer : styles.answerAuthorContainer
                  ]}>
                    <Text style={[
                      styles.messageAuthor,
                      item.type === 'question' ? styles.questionAuthor : styles.answerAuthor
                    ]}>
                      {item.author}
                      {item.authorLevel && (
                        <Text style={styles.authorLevel}> ({item.authorLevel})</Text>
                      )}
                    </Text>
                  </View>
                  
                  {/* 말풍선 */}
                  <View style={[
                    styles.messageBubble,
                    item.type === 'question' ? styles.questionBubble : styles.answerBubble
                  ]}>
                    <Text style={[
                      styles.messageContent,
                      item.type === 'answer' && { color: '#FFFFFF' }
                    ]}>{item.content}</Text>
                  </View>
                  
                  {/* 시간 표시 */}
                  <Text style={[
                    styles.messageTime,
                    item.type === 'question' ? styles.questionTime : styles.answerTime
                  ]}>{item.timestamp}</Text>
                </View>
              </View>
            );
          })}
        </View>

      </ScrollView>

      {/* 하단 입찰 영역 */}
      <View style={styles.bottomSection}>
        <View style={styles.bidInputContainer}>
          <TextInput
            style={styles.bidInput}
            placeholder={`최소 ${(auction.currentPrice + auction.minimumBidIncrement).toLocaleString()}`}
            value={bidAmount}
            onChangeText={(text) => {
              const numericValue = text.replace(/[^0-9]/g, '');
              if (numericValue) {
                setBidAmount(parseInt(numericValue).toLocaleString());
              } else {
                setBidAmount('');
              }
            }}
            keyboardType="numeric"
          />
          <Text style={styles.currencyText}>원</Text>
        </View>
        
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.bidButton}
            onPress={handleBid}
          >
            <Text style={styles.bidButtonText}>입찰하기</Text>
          </TouchableOpacity>
          
          {auction.buyNowPrice && (
            <TouchableOpacity
              style={styles.buyNowButton}
              onPress={handleBuyNow}
            >
              <Text style={styles.buyNowButtonText}>즉시구매</Text>
            </TouchableOpacity>
          )}
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    backgroundColor: '#FFFFFF',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 20,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 12,
  },
  headerActionButton: {
    padding: 4,
  },
  content: {
    flex: 1,
  },
  section: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F8F8F8',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 12,
  },
  // 이미지 섹션
  imageSection: {
    borderBottomWidth: 1,
    borderBottomColor: '#F8F8F8',
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
    top: 12,
    right: 12,
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
  // 제목 및 가격
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
    fontSize: 14,
    color: '#999999',
    marginBottom: 2,
  },
  buyNowPrice: {
    fontSize: 14,
    color: '#666666',
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
    marginLeft: 6,
  },
  // 구매일
  purchaseDate: {
    fontSize: 15,
    color: '#333333',
    backgroundColor: '#F8F8F8',
    padding: 12,
    borderRadius: 8,
    textAlign: 'center',
  },
  // 상태 슬라이더
  conditionDescription: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 16,
  },
  conditionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  conditionLabel: {
    fontSize: 14,
    color: '#666666',
  },
  conditionDotsContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 16,
  },
  conditionDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    backgroundColor: '#FFFFFF',
  },
  conditionDotActive: {
    borderColor: '#FF6B6B',
    backgroundColor: '#FF6B6B',
  },
  conditionValueContainer: {
    alignItems: 'center',
    marginLeft: 12,
  },
  conditionValueCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FF6B6B',
    justifyContent: 'center',
    alignItems: 'center',
  },
  conditionValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  // 판매자 정보 개선
  sellerInfoContainer: {
    backgroundColor: '#FAFAFA',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 20,
    marginVertical: 12,
  },
  sellerProfileSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  profileIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  sellerBasicInfo: {
    flex: 1,
  },
  sellerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 4,
  },
  sellerLocation: {
    fontSize: 12,
    color: '#666666',
  },
  rightSection: {
    alignItems: 'flex-end',
  },
  sellerLevelBadge: {
    backgroundColor: '#4A90E2',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    marginBottom: 6,
  },
  sellerLevelText: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  sellerRating: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sellerRatingLabel: {
    fontSize: 14,
    color: '#333333',
    marginRight: 4,
    fontWeight: '500',
  },
  starContainer: {
    flexDirection: 'row',
    marginRight: 4,
  },
  ratingText: {
    fontSize: 13,
    color: '#666666',
    marginLeft: 4,
  },
  sellerStatsContainer: {
    backgroundColor: '#FAFAFA',
    borderRadius: 12,
    padding: 16,
  },
  sellerStatItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#E3F2FD',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  statInfo: {
    flex: 1,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 12,
    color: '#666666',
  },
  // 설명
  description: {
    fontSize: 15,
    color: '#333333',
    lineHeight: 22,
  },
  // 입찰 내역
  bidHeaderContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  bidCount: {
    fontSize: 14,
    color: '#666666',
    fontWeight: '500',
  },
  bidItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  topBid: {
    backgroundColor: '#FFF5F5',
    marginHorizontal: -20,
    paddingHorizontal: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#FF6B6B',
  },
  bidInfo: {
    flex: 1,
  },
  bidAmount: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 2,
  },
  topBidAmount: {
    color: '#FF6B6B',
    fontSize: 18,
  },
  bidder: {
    fontSize: 14,
    color: '#666666',
  },
  bidTime: {
    fontSize: 12,
    color: '#999999',
  },
  // 하단 입찰 영역
  bottomSection: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    paddingBottom: 34,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    backgroundColor: '#FFFFFF',
  },
  bidInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 16,
    marginBottom: 12,
    backgroundColor: '#FAFAFA',
  },
  bidInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    textAlign: 'right',
  },
  currencyText: {
    fontSize: 16,
    color: '#666666',
    marginLeft: 8,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  bidButton: {
    flex: 1,
    paddingVertical: 16,
    backgroundColor: '#FF6B6B',
    borderRadius: 8,
    alignItems: 'center',
  },
  bidButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  buyNowButton: {
    flex: 1,
    paddingVertical: 16,
    backgroundColor: '#4CAF50',
    borderRadius: 8,
    alignItems: 'center',
  },
  buyNowButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  // Q&A 채팅 스타일
  chatMessage: {
    marginBottom: 12,
  },
  questionMessage: {
    alignItems: 'flex-start',
  },
  answerMessage: {
    alignItems: 'flex-end',
  },
  messageWrapper: {
    maxWidth: '75%',
  },
  authorContainer: {
    marginBottom: 4,
  },
  questionAuthorContainer: {
    alignItems: 'flex-start',
  },
  answerAuthorContainer: {
    alignItems: 'flex-end',
  },
  messageBubble: {
    borderRadius: 16,
    padding: 12,
    marginBottom: 2,
  },
  questionBubble: {
    backgroundColor: '#F0F0F0',
    borderBottomLeftRadius: 4,
  },
  answerBubble: {
    backgroundColor: '#4CAF50',
    borderBottomRightRadius: 4,
  },
  messageAuthor: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666666',
  },
  questionAuthor: {
    color: '#666666',
  },
  answerAuthor: {
    color: '#666666',
  },
  authorLevel: {
    fontWeight: '400',
    opacity: 0.7,
  },
  messageTime: {
    fontSize: 10,
    color: '#999999',
  },
  questionTime: {
    textAlign: 'left',
  },
  answerTime: {
    textAlign: 'right',
  },
  replyMessage: {
    marginTop: 4,
  },
  replyIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    gap: 4,
  },
  answerReplyIndicator: {
    alignSelf: 'flex-end',
  },
  questionReplyIndicator: {
    alignSelf: 'flex-start',
  },
  replyText: {
    fontSize: 11,
    color: '#999999',
    fontStyle: 'italic',
  },
  messageContent: {
    fontSize: 14,
    lineHeight: 20,
    color: '#333333',
  },
  relatedQuestionContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FFFFFF',
    padding: 10,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    gap: 8,
  },
  relatedQuestionText: {
    flex: 1,
    fontSize: 13,
    color: '#666666',
    lineHeight: 18,
  },
  // 질문 입력칸 스타일
  questionInputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#F8F8F8',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    gap: 12,
  },
  questionInput: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    color: '#333333',
    minHeight: 40,
    maxHeight: 80,
  },
  questionSubmitButton: {
    backgroundColor: '#FF6B6B',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 48,
  },
  questionSubmitText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
});