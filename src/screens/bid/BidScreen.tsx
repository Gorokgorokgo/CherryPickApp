import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  TextInput,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import { formatCurrency, formatTimeRemaining } from '../../utils/format';

interface BidScreenProps {
  navigation: any;
  route: {
    params: {
      auctionId: string;
      currentPrice: number;
      timeRemaining: Date;
      title: string;
    };
  };
}

const BidScreen: React.FC<BidScreenProps> = ({ navigation, route }) => {
  const { auctionId, currentPrice, timeRemaining, title } = route.params;
  
  const [bidAmount, setBidAmount] = useState<number>(0);
  const [customBidAmount, setCustomBidAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [showBidModal, setShowBidModal] = useState(false);

  // 입찰 단위 (5-10% 단위)
  const bidIncrements = [
    Math.ceil(currentPrice * 0.05 / 1000) * 1000, // 5%
    Math.ceil(currentPrice * 0.075 / 1000) * 1000, // 7.5%
    Math.ceil(currentPrice * 0.1 / 1000) * 1000, // 10%
  ];

  useEffect(() => {
    // 기본 입찰가 설정 (최소 증가폭)
    setBidAmount(currentPrice + bidIncrements[0]);
  }, [currentPrice]);

  const handleBidAmountSelect = (amount: number) => {
    setBidAmount(currentPrice + amount);
    setCustomBidAmount('');
  };

  const handleCustomBidChange = (text: string) => {
    const numericValue = text.replace(/[^0-9]/g, '');
    setCustomBidAmount(numericValue);
    
    if (numericValue) {
      setBidAmount(parseInt(numericValue, 10));
    }
  };

  const validateBidAmount = (): boolean => {
    if (bidAmount <= currentPrice) {
      Alert.alert('알림', '현재가보다 높은 금액으로 입찰해주세요.');
      return false;
    }

    const minIncrement = Math.ceil(currentPrice * 0.05 / 1000) * 1000;
    if (bidAmount < currentPrice + minIncrement) {
      Alert.alert('알림', `최소 입찰 금액은 ${formatCurrency(currentPrice + minIncrement)}원입니다.`);
      return false;
    }

    return true;
  };

  const handleBidSubmit = () => {
    if (!validateBidAmount()) return;
    setShowBidModal(true);
  };

  const confirmBid = async () => {
    setLoading(true);
    setShowBidModal(false);

    try {
      // TODO: 입찰 API 호출
      await new Promise(resolve => setTimeout(resolve, 2000));

      Alert.alert(
        '입찰 완료',
        `${formatCurrency(bidAmount)}원으로 입찰이 등록되었습니다.`,
        [
          {
            text: '확인',
            onPress: () => {
              navigation.goBack();
              // TODO: 실시간 업데이트를 위한 웹소켓 알림
            },
          },
        ]
      );
    } catch (error) {
      Alert.alert('오류', '입찰 등록에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setLoading(false);
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
        <Text style={styles.headerTitle}>입찰하기</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* 경매 정보 */}
        <Card style={styles.auctionInfo}>
          <View style={styles.auctionHeader}>
            <Icon name="gavel" size={24} color="#FF6B6B" />
            <Text style={styles.auctionTitle}>{title}</Text>
          </View>
          
          <View style={styles.auctionStats}>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>현재가</Text>
              <Text style={styles.currentPrice}>
                {formatCurrency(currentPrice)}원
              </Text>
            </View>
            
            <View style={styles.statDivider} />
            
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>남은 시간</Text>
              <Text style={styles.timeRemaining}>
                {formatTimeRemaining(timeRemaining)}
              </Text>
            </View>
          </View>
        </Card>

        {/* 입찰 금액 선택 */}
        <Card style={styles.bidSection}>
          <Text style={styles.sectionTitle}>입찰 금액</Text>
          
          <View style={styles.quickBids}>
            {bidIncrements.map((increment, index) => {
              const percentage = index === 0 ? '5%' : index === 1 ? '7.5%' : '10%';
              const totalAmount = currentPrice + increment;
              
              return (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.bidButton,
                    bidAmount === totalAmount && styles.selectedBidButton,
                  ]}
                  onPress={() => handleBidAmountSelect(increment)}
                >
                  <Text
                    style={[
                      styles.bidButtonText,
                      bidAmount === totalAmount && styles.selectedBidButtonText,
                    ]}
                  >
                    +{formatCurrency(increment)}원
                  </Text>
                  <Text
                    style={[
                      styles.bidPercentageText,
                      bidAmount === totalAmount && styles.selectedBidPercentageText,
                    ]}
                  >
                    ({percentage} 증가)
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <View style={styles.customBidSection}>
            <Text style={styles.customBidLabel}>직접 입력</Text>
            <View style={styles.customBidInput}>
              <TextInput
                style={styles.bidInput}
                value={customBidAmount ? formatCurrency(parseInt(customBidAmount, 10)) : ''}
                onChangeText={handleCustomBidChange}
                placeholder={`${formatCurrency(currentPrice + bidIncrements[0])}원 이상`}
                keyboardType="numeric"
                maxLength={12}
              />
              <Text style={styles.currencyText}>원</Text>
            </View>
          </View>

          {/* 입찰 금액 표시 */}
          {bidAmount > currentPrice && (
            <View style={styles.bidSummary}>
              <Text style={styles.bidSummaryLabel}>입찰 예정 금액</Text>
              <Text style={styles.bidSummaryAmount}>
                {formatCurrency(bidAmount)}원
              </Text>
              <Text style={styles.bidIncreaseAmount}>
                현재가 대비 +{formatCurrency(bidAmount - currentPrice)}원
              </Text>
            </View>
          )}
        </Card>

        {/* 입찰 안내 */}
        <Card style={styles.infoCard}>
          <View style={styles.infoHeader}>
            <Icon name="info-outline" size={20} color="#FF6B6B" />
            <Text style={styles.infoTitle}>입찰 안내</Text>
          </View>
          <View style={styles.infoContent}>
            <Text style={styles.infoText}>• 모든 레벨에서 무료 입찰이 가능합니다</Text>
            <Text style={styles.infoText}>• 최소 입찰 단위: 현재가의 5% 이상</Text>
            <Text style={styles.infoText}>• 낙찰 시 연결 서비스 수수료가 발생합니다 (3%)</Text>
            <Text style={styles.infoText}>• 실시간으로 입찰 현황이 업데이트됩니다</Text>
            <Text style={styles.infoText}>• 경매 종료 5분 전 입찰시 5분 연장됩니다</Text>
          </View>
        </Card>
      </ScrollView>

      {/* 입찰하기 버튼 */}
      <View style={styles.bottomSection}>
        <Button
          title={`${formatCurrency(bidAmount)}원으로 입찰하기`}
          onPress={handleBidSubmit}
          disabled={bidAmount <= currentPrice}
          loading={loading}
        />
      </View>

      {/* 입찰 확인 모달 */}
      <Modal
        visible={showBidModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowBidModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Icon name="gavel" size={32} color="#FF6B6B" />
              <Text style={styles.modalTitle}>입찰 확인</Text>
            </View>
            
            <View style={styles.modalBody}>
              <Text style={styles.modalText}>
                <Text style={styles.modalHighlight}>{title}</Text>에
              </Text>
              <Text style={styles.modalText}>
                <Text style={styles.modalHighlight}>{formatCurrency(bidAmount)}원</Text>으로 입찰하시겠습니까?
              </Text>
              
              <View style={styles.modalInfo}>
                <Text style={styles.modalInfoText}>
                  • 낙찰 시 연결 서비스 수수료: {formatCurrency(Math.floor(bidAmount * 0.03))}원
                </Text>
                <Text style={styles.modalInfoText}>
                  • 입찰 후 취소가 불가능합니다
                </Text>
              </View>
            </View>
            
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowBidModal(false)}
              >
                <Text style={styles.cancelButtonText}>취소</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.confirmButton]}
                onPress={confirmBid}
              >
                <Text style={styles.confirmButtonText}>입찰하기</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  content: {
    flex: 1,
    padding: 16,
  },
  auctionInfo: {
    padding: 20,
    marginBottom: 16,
    backgroundColor: 'white',
  },
  auctionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  auctionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginLeft: 8,
    flex: 1,
  },
  auctionStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  currentPrice: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FF6B6B',
  },
  timeRemaining: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#e0e0e0',
    marginHorizontal: 16,
  },
  bidSection: {
    padding: 20,
    marginBottom: 16,
    backgroundColor: 'white',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  quickBids: {
    gap: 12,
    marginBottom: 24,
  },
  bidButton: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: 'white',
    alignItems: 'center',
  },
  selectedBidButton: {
    borderColor: '#FF6B6B',
    backgroundColor: '#FFF5F5',
  },
  bidButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  selectedBidButtonText: {
    color: '#FF6B6B',
  },
  bidPercentageText: {
    fontSize: 12,
    color: '#666',
  },
  selectedBidPercentageText: {
    color: '#FF6B6B',
  },
  customBidSection: {
    marginTop: 8,
  },
  customBidLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 12,
  },
  customBidInput: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 16,
    backgroundColor: 'white',
  },
  bidInput: {
    flex: 1,
    paddingVertical: 16,
    fontSize: 16,
    color: '#333',
  },
  currencyText: {
    fontSize: 16,
    color: '#666',
    marginLeft: 8,
  },
  bidSummary: {
    marginTop: 20,
    padding: 16,
    backgroundColor: '#F8F9FF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E3E8FF',
  },
  bidSummaryLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  bidSummaryAmount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FF6B6B',
    marginBottom: 4,
  },
  bidIncreaseAmount: {
    fontSize: 14,
    color: '#4CAF50',
  },
  infoCard: {
    padding: 16,
    marginBottom: 32,
    backgroundColor: 'white',
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginLeft: 8,
  },
  infoContent: {
    gap: 6,
  },
  infoText: {
    fontSize: 13,
    color: '#666',
    lineHeight: 18,
  },
  bottomSection: {
    padding: 16,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 24,
    width: '100%',
    maxWidth: 400,
  },
  modalHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginTop: 8,
  },
  modalBody: {
    marginBottom: 24,
  },
  modalText: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 4,
  },
  modalHighlight: {
    fontWeight: '600',
    color: '#FF6B6B',
  },
  modalInfo: {
    marginTop: 16,
    padding: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
  },
  modalInfoText: {
    fontSize: 13,
    color: '#666',
    lineHeight: 18,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#f5f5f5',
  },
  confirmButton: {
    backgroundColor: '#FF6B6B',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#666',
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: 'white',
  },
});

export default BidScreen;