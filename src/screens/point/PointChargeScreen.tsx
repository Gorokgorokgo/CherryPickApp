import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Icon } from '../../components/common';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import { formatCurrency } from '../../utils/format';

interface PaymentMethod {
  id: string;
  type: 'card' | 'bank';
  name: string;
  number: string;
  isDefault: boolean;
}

interface PointChargeScreenProps {
  navigation: any;
}

const PointChargeScreen: React.FC<PointChargeScreenProps> = ({ navigation }) => {
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState('');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const quickAmounts = [10000, 30000, 50000, 100000, 200000, 500000];

  const paymentMethods: PaymentMethod[] = [
    {
      id: '1',
      type: 'card',
      name: '신한카드',
      number: '**** **** **** 1234',
      isDefault: true,
    },
    {
      id: '2',
      type: 'bank',
      name: '국민은행',
      number: '123-45-6789**',
      isDefault: false,
    },
  ];

  const handleAmountSelect = (amount: number) => {
    setSelectedAmount(amount);
    setCustomAmount('');
  };

  const handleCustomAmountChange = (text: string) => {
    const numericValue = text.replace(/[^0-9]/g, '');
    setCustomAmount(numericValue);

    if (numericValue) {
      setSelectedAmount(parseInt(numericValue, 10));
    } else {
      setSelectedAmount(null);
    }
  };

  const handlePaymentMethodSelect = (methodId: string) => {
    setSelectedPaymentMethod(methodId);
  };

  const handleCharge = async () => {
    if (!selectedAmount) {
      Alert.alert('알림', '충전할 금액을 선택해주세요.');
      return;
    }

    if (selectedAmount < 1000) {
      Alert.alert('알림', '최소 충전 금액은 1,000원입니다.');
      return;
    }

    if (selectedAmount > 1000000) {
      Alert.alert('알림', '1회 최대 충전 금액은 1,000,000원입니다.');
      return;
    }

    if (!selectedPaymentMethod) {
      Alert.alert('알림', '결제 수단을 선택해주세요.');
      return;
    }

    Alert.alert(
      '포인트 충전',
      `${formatCurrency(selectedAmount)}원을 충전하시겠습니까?`,
      [
        { text: '취소', style: 'cancel' },
        {
          text: '충전',
          onPress: async () => {
            setLoading(true);

            try {
              // TODO: API 호출
              await new Promise<void>(resolve => setTimeout(() => resolve(), 2000));

              Alert.alert(
                '충전 완료',
                `${formatCurrency(selectedAmount)}원이 충전되었습니다.`,
                [
                  {
                    text: '확인',
                    onPress: () => navigation.goBack(),
                  },
                ]
              );
            } catch (error) {
              Alert.alert('오류', '충전에 실패했습니다. 다시 시도해주세요.');
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const getPaymentIcon = (type: string) => {
    return type === 'card' ? 'credit-card' : 'account-balance';
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
        <Text style={styles.headerTitle}>포인트 충전</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* 충전 금액 선택 */}
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>충전 금액</Text>

          <View style={styles.customAmountSection}>
            <Text style={styles.customAmountLabel}>직접 입력</Text>
            <View style={styles.customAmountInput}>
              <TextInput
                style={styles.amountInput}
                value={customAmount ? formatCurrency(parseInt(customAmount, 10)) : ''}
                onChangeText={handleCustomAmountChange}
                keyboardType="numeric"
                maxLength={10}
              />
              <Text style={styles.currencyText}>원</Text>
            </View>
            <Text style={styles.amountGuide}>
            </Text>
          </View>

          <View style={styles.quickAmounts}>
            {quickAmounts.map((amount) => (
              <TouchableOpacity
                key={amount}
                style={[
                  styles.amountButton,
                  selectedAmount === amount && styles.selectedAmountButton,
                ]}
                onPress={() => handleAmountSelect(amount)}
              >
                <Text
                  style={[
                    styles.amountButtonText,
                    selectedAmount === amount && styles.selectedAmountButtonText,
                  ]}
                >
                  {formatCurrency(amount)}원
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </Card>

        {/* 결제 수단 선택 */}
        <Card style={styles.section}>
          <View style={styles.paymentHeader}>
            <Text style={styles.sectionTitle}>결제 수단</Text>
            <TouchableOpacity onPress={() => navigation.navigate('PaymentMethods')}>
              <Text style={styles.addPaymentText}>+ 추가</Text>
            </TouchableOpacity>
          </View>

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
                        <Text style={styles.defaultBadgeText}>기본</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.paymentMethodNumber}>{method.number}</Text>
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

        {/* 충전 안내 */}
        <Card style={styles.section}>
          <View style={styles.infoHeader}>
            <Icon name="info" size={20} color="#FF6B6B" />
            <Text style={styles.infoTitle}>충전 안내</Text>
          </View>
          <View style={styles.infoContent}>
            <Text style={styles.infoText}>• 충전된 포인트는 즉시 사용 가능합니다</Text>
            <Text style={styles.infoText}>• 결제 실패 시 자동으로 취소됩니다</Text>
          </View>
        </Card>
      </ScrollView>

      {/* 충전하기 버튼 */}
      <View style={styles.bottomSection}>
        {selectedAmount && (
          <View style={styles.chargeInfo}>
            <Text style={styles.chargeAmountText}>
              충전 금액: {formatCurrency(selectedAmount)}원
            </Text>
          </View>
        )}
        <Button
          title="충전하기"
          onPress={handleCharge}
          disabled={!selectedAmount || !selectedPaymentMethod}
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
  section: {
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
  quickAmounts: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  amountButton: {
    width: '48%',
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: 'white',
    alignItems: 'center',
    marginBottom: 8,
  },
  selectedAmountButton: {
    borderColor: '#FF6B6B',
    backgroundColor: '#FFF5F5',
  },
  amountButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
  },
  selectedAmountButtonText: {
    color: '#FF6B6B',
  },
  customAmountSection: {
    marginTop: 8,
  },
  customAmountLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 12,
  },
  customAmountInput: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 16,
    backgroundColor: 'white',
    marginBottom: 8,
  },
  amountInput: {
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
  amountGuide: {
    fontSize: 12,
    color: '#999',
  },
  paymentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  addPaymentText: {
    fontSize: 14,
    color: '#FF6B6B',
    fontWeight: '500',
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
    backgroundColor: '#FF6B6B',
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
  chargeInfo: {
    marginBottom: 12,
  },
  chargeAmountText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
  },
});

export default PointChargeScreen;