import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import { formatCurrency } from '../../utils/format';

interface ConnectionPaymentScreenProps {
  navigation: any;
  route: {
    params: {
      auctionId: string;
      title: string;
      finalPrice: number;
      sellerName: string;
      userLevel: number;
    };
  };
}

interface PaymentMethod {
  id: string;
  type: 'card' | 'bank' | 'point';
  name: string;
  number: string;
  isDefault: boolean;
  balance?: number; // 포인트의 경우
}

const ConnectionPaymentScreen: React.FC<ConnectionPaymentScreenProps> = ({
  navigation,
  route,
}) => {
  const { auctionId, title, finalPrice, sellerName, userLevel } = route.params;
  
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string | null>('point');
  const [loading, setLoading] = useState(false);

  // 레벨별 할인율 계산
  const getDiscountRate = (level: number): number => {
    const discountRates: { [key: number]: number } = {
      1: 0,    // 0% 할인
      2: 0.1,  // 10% 할인
      3: 0.15, // 15% 할인
      4: 0.25, // 25% 할인
      5: 0.4,  // 40% 할인
    };
    return discountRates[level] || 0;
  };

  const baseServiceFee = Math.floor(finalPrice * 0.03); // 3% 기본 수수료
  const discountRate = getDiscountRate(userLevel);
  const discountAmount = Math.floor(baseServiceFee * discountRate);
  const finalServiceFee = baseServiceFee - discountAmount;

  const paymentMethods: PaymentMethod[] = [
    {
      id: 'point',
      type: 'point',
      name: '체리픽 포인트',
      number: '',
      isDefault: true,
      balance: 150000,
    },
    {
      id: '1',
      type: 'card',
      name: '신한카드',
      number: '**** **** **** 1234',
      isDefault: false,
    },
    {
      id: '2',
      type: 'bank',
      name: '국민은행',
      number: '123-45-6789**',
      isDefault: false,
    },
  ];

  const handlePaymentMethodSelect = (methodId: string) => {
    setSelectedPaymentMethod(methodId);
  };

  const handlePayment = async () => {
    if (!selectedPaymentMethod) {
      Alert.alert('알림', '결제 수단을 선택해주세요.');
      return;
    }

    const pointMethod = paymentMethods.find(m => m.id === 'point');
    if (selectedPaymentMethod === 'point' && pointMethod?.balance! < finalServiceFee) {
      Alert.alert(
        '포인트 부족',
        '포인트가 부족합니다. 포인트를 충전하시겠습니까?',
        [
          { text: '취소', style: 'cancel' },
          {
            text: '포인트 충전',
            onPress: () => navigation.navigate('PointCharge'),
          },
        ]
      );
      return;
    }

    Alert.alert(
      '연결 서비스 결제',
      `${formatCurrency(finalServiceFee)}원을 결제하시겠습니까?\n\n결제 완료 후 판매자와 채팅을 시작할 수 있습니다.`,
      [
        { text: '취소', style: 'cancel' },
        {
          text: '결제',
          onPress: async () => {
            setLoading(true);
            
            try {
              // TODO: 결제 API 호출
              await new Promise(resolve => setTimeout(resolve, 2000));
              
              Alert.alert(
                '결제 완료',
                '연결 서비스 결제가 완료되었습니다.\n이제 판매자와 채팅할 수 있습니다.',
                [
                  {
                    text: '채팅 시작',
                    onPress: () => {
                      navigation.replace('ChatRoom', {
                        auctionId,
                        title,
                        partnerName: sellerName,
                        partnerType: 'seller',
                      });
                    },
                  },
                ]
              );
            } catch (error) {
              Alert.alert('오류', '결제에 실패했습니다. 다시 시도해주세요.');
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const getPaymentIcon = (type: string) => {
    switch (type) {
      case 'point':
        return 'account-balance-wallet';
      case 'card':
        return 'credit-card';
      case 'bank':
        return 'account-balance';
      default:
        return 'payment';
    }
  };

  const getLevelBadge = (level: number) => {
    const colors: { [key: number]: string } = {
      1: '#999999',
      2: '#4CAF50',
      3: '#2196F3',
      4: '#9C27B0',
      5: '#FF9800',
    };
    
    return (
      <View style={[styles.levelBadge, { backgroundColor: colors[level] || '#999999' }]}>
        <Text style={styles.levelBadgeText}>Lv.{level}</Text>
      </View>
    );
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
        <Text style={styles.headerTitle}>연결 서비스 결제</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* 낙찰 정보 */}
        <Card style={styles.auctionInfo}>
          <View style={styles.auctionHeader}>
            <Icon name="emoji-events" size={24} color="#FFD700" />
            <Text style={styles.congratsText}>낙찰을 축하합니다!</Text>
          </View>
          
          <Text style={styles.auctionTitle}>{title}</Text>
          
          <View style={styles.auctionStats}>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>낙찰가</Text>
              <Text style={styles.finalPrice}>
                {formatCurrency(finalPrice)}원
              </Text>
            </View>
            
            <View style={styles.statDivider} />
            
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>판매자</Text>
              <Text style={styles.sellerName}>{sellerName}</Text>
            </View>
          </View>
        </Card>

        {/* 수수료 계산 */}
        <Card style={styles.feeSection}>
          <View style={styles.feeHeader}>
            <Text style={styles.sectionTitle}>연결 서비스 수수료</Text>
            {getLevelBadge(userLevel)}
          </View>
          
          <View style={styles.feeCalculation}>
            <View style={styles.feeRow}>
              <Text style={styles.feeLabel}>기본 수수료 (3%)</Text>
              <Text style={styles.feeValue}>
                {formatCurrency(baseServiceFee)}원
              </Text>
            </View>
            
            {discountAmount > 0 && (
              <View style={styles.feeRow}>
                <Text style={[styles.feeLabel, styles.discountLabel]}>
                  레벨 {userLevel} 할인 ({Math.floor(discountRate * 100)}%)
                </Text>
                <Text style={[styles.feeValue, styles.discountValue]}>
                  -{formatCurrency(discountAmount)}원
                </Text>
              </View>
            )}
            
            <View style={styles.feeDivider} />
            
            <View style={styles.feeRow}>
              <Text style={styles.feeTotal}>최종 결제 금액</Text>
              <Text style={styles.feeTotalValue}>
                {formatCurrency(finalServiceFee)}원
              </Text>
            </View>
          </View>

          <View style={styles.feeInfo}>
            <Icon name="info-outline" size={16} color="#666" />
            <Text style={styles.feeInfoText}>
              연결 서비스 수수료 결제 후 판매자와 채팅을 시작할 수 있습니다.
            </Text>
          </View>
        </Card>

        {/* 결제 수단 선택 */}
        <Card style={styles.paymentSection}>
          <Text style={styles.sectionTitle}>결제 수단 선택</Text>
          
          {paymentMethods.map((method) => (
            <TouchableOpacity
              key={method.id}
              style={[
                styles.paymentMethod,
                selectedPaymentMethod === method.id && styles.selectedPaymentMethod,
              ]}
              onPress={() => handlePaymentMethodSelect(method.id)}
            >
              <View style={styles.paymentMethodContent}>
                <Icon
                  name={getPaymentIcon(method.type)}
                  size={24}
                  color={selectedPaymentMethod === method.id ? '#FF6B6B' : '#666'}
                />
                <View style={styles.paymentMethodDetails}>
                  <View style={styles.paymentMethodHeader}>
                    <Text style={styles.paymentMethodName}>{method.name}</Text>
                    {method.isDefault && (
                      <View style={styles.defaultBadge}>
                        <Text style={styles.defaultBadgeText}>추천</Text>
                      </View>
                    )}
                  </View>
                  
                  {method.type === 'point' ? (
                    <View style={styles.pointBalance}>
                      <Text style={styles.pointBalanceText}>
                        잔액: {formatCurrency(method.balance!)}원
                      </Text>
                      {method.balance! < finalServiceFee && (
                        <Text style={styles.insufficientText}>잔액 부족</Text>
                      )}
                    </View>
                  ) : (
                    <Text style={styles.paymentMethodNumber}>{method.number}</Text>
                  )}
                </View>
              </View>
              <Icon
                name={selectedPaymentMethod === method.id ? 'radio-button-checked' : 'radio-button-unchecked'}
                size={24}
                color={selectedPaymentMethod === method.id ? '#FF6B6B' : '#ccc'}
              />
            </TouchableOpacity>
          ))}
        </Card>

        {/* 서비스 안내 */}
        <Card style={styles.serviceInfo}>
          <View style={styles.infoHeader}>
            <Icon name="support-agent" size={20} color="#FF6B6B" />
            <Text style={styles.infoTitle}>연결 서비스란?</Text>
          </View>
          <View style={styles.infoContent}>
            <Text style={styles.infoText}>• 낙찰자와 판매자를 안전하게 연결해드립니다</Text>
            <Text style={styles.infoText}>• 실시간 채팅으로 거래 진행이 가능합니다</Text>
            <Text style={styles.infoText}>• 거래 완료 확인까지 분쟁 중재 서비스를 제공합니다</Text>
            <Text style={styles.infoText}>• 레벨이 높을수록 더 많은 할인 혜택을 받을 수 있습니다</Text>
          </View>
        </Card>
      </ScrollView>

      {/* 결제 버튼 */}
      <View style={styles.bottomSection}>
        <View style={styles.paymentSummary}>
          <Text style={styles.paymentSummaryText}>
            결제 금액: {formatCurrency(finalServiceFee)}원
          </Text>
          {discountAmount > 0 && (
            <Text style={styles.savingText}>
              {formatCurrency(discountAmount)}원 할인 적용
            </Text>
          )}
        </View>
        <Button
          title="결제하고 채팅 시작하기"
          onPress={handlePayment}
          disabled={!selectedPaymentMethod}
          loading={loading}
        />
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
  congratsText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginLeft: 8,
  },
  auctionTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 16,
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
  finalPrice: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FF6B6B',
  },
  sellerName: {
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
  feeSection: {
    padding: 20,
    marginBottom: 16,
    backgroundColor: 'white',
  },
  feeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  levelBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignItems: 'center',
  },
  levelBadgeText: {
    fontSize: 12,
    color: 'white',
    fontWeight: '600',
  },
  feeCalculation: {
    marginBottom: 16,
  },
  feeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  feeLabel: {
    fontSize: 14,
    color: '#666',
  },
  discountLabel: {
    color: '#4CAF50',
  },
  feeValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  discountValue: {
    color: '#4CAF50',
  },
  feeDivider: {
    height: 1,
    backgroundColor: '#e0e0e0',
    marginVertical: 8,
  },
  feeTotal: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  feeTotalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FF6B6B',
  },
  feeInfo: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
  },
  feeInfoText: {
    fontSize: 13,
    color: '#666',
    lineHeight: 18,
    marginLeft: 8,
    flex: 1,
  },
  paymentSection: {
    padding: 20,
    marginBottom: 16,
    backgroundColor: 'white',
  },
  paymentMethod: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    marginBottom: 12,
    backgroundColor: 'white',
  },
  selectedPaymentMethod: {
    borderColor: '#FF6B6B',
    backgroundColor: '#FFF5F5',
  },
  paymentMethodContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  paymentMethodDetails: {
    marginLeft: 12,
    flex: 1,
  },
  paymentMethodHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  paymentMethodName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  defaultBadge: {
    marginLeft: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
    backgroundColor: '#4CAF50',
    borderRadius: 4,
  },
  defaultBadgeText: {
    fontSize: 10,
    color: 'white',
    fontWeight: '500',
  },
  paymentMethodNumber: {
    fontSize: 14,
    color: '#666',
  },
  pointBalance: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pointBalanceText: {
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: '500',
  },
  insufficientText: {
    fontSize: 12,
    color: '#F44336',
    marginLeft: 8,
    fontWeight: '500',
  },
  serviceInfo: {
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
  paymentSummary: {
    marginBottom: 12,
    alignItems: 'center',
  },
  paymentSummaryText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  savingText: {
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: '500',
  },
});

export default ConnectionPaymentScreen;