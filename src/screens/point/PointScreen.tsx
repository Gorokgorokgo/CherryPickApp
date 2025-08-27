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
import { Icon } from '../../components/common';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import { formatCurrency } from '../../utils/format';

interface PointTransaction {
  id: string;
  type: 'charge' | 'use' | 'refund';
  amount: number;
  description: string;
  createdAt: Date;
  status: 'completed' | 'pending' | 'failed';
}

interface PointScreenProps {
  navigation: any;
}

const PointScreen: React.FC<PointScreenProps> = ({ navigation }) => {
  const [currentPoints, setCurrentPoints] = useState(125000);
  const [transactions, setTransactions] = useState<PointTransaction[]>([
    {
      id: '1',
      type: 'charge',
      amount: 100000,
      description: '포인트 충전',
      createdAt: new Date('2024-08-20'),
      status: 'completed',
    },
    {
      id: '2',
      type: 'use',
      amount: -15000,
      description: '연결 서비스 수수료',
      createdAt: new Date('2024-08-19'),
      status: 'completed',
    },
    {
      id: '3',
      type: 'charge',
      amount: 50000,
      description: '포인트 충전',
      createdAt: new Date('2024-08-18'),
      status: 'completed',
    },
  ]);
  const [loading, setLoading] = useState(false);

  const handleChargePoint = () => {
    navigation.navigate('PointCharge');
  };

  const handleWithdraw = () => {
    Alert.alert(
      '포인트 출금',
      '최소 1,000원 이상 출금 가능합니다.\n본인 명의 계좌로만 출금됩니다.',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '출금하기',
          onPress: () => navigation.navigate('PointWithdraw'),
        },
      ]
    );
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'charge':
        return 'add-circle';
      case 'use':
        return 'remove-circle';
      case 'refund':
        return 'refresh';
      default:
        return 'help-outline';
    }
  };

  const getTransactionColor = (type: string) => {
    switch (type) {
      case 'charge':
        return '#4CAF50';
      case 'use':
        return '#F44336';
      case 'refund':
        return '#FF9800';
      default:
        return '#999999';
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
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
        <Text style={styles.headerTitle}>포인트 관리</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* 포인트 잔액 카드 */}
        <Card style={styles.balanceCard}>
          <View style={styles.balanceHeader}>
            <Icon name="account-balance-wallet" size={32} color="#FF6B6B" />
            <Text style={styles.balanceLabel}>현재 포인트</Text>
          </View>
          <Text style={styles.balanceAmount}>
            {formatCurrency(currentPoints)}원
          </Text>
          
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={[styles.actionButton, styles.chargeButton]}
              onPress={handleChargePoint}
            >
              <Icon name="add" size={20} color="white" />
              <Text style={styles.actionButtonText}>충전</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.actionButton, styles.withdrawButton]}
              onPress={handleWithdraw}
            >
              <Icon name="credit-card" size={20} color="#333" />
              <Text style={[styles.actionButtonText, { color: '#333' }]}>출금</Text>
            </TouchableOpacity>
          </View>
        </Card>

        {/* 포인트 안내 */}
        <Card style={styles.infoCard}>
          <View style={styles.infoHeader}>
            <Icon name="info-outline" size={24} color="#FF6B6B" />
            <Text style={styles.infoTitle}>포인트 이용 안내</Text>
          </View>
          <View style={styles.infoContent}>
            <Text style={styles.infoText}>• 충전: 1,000원 단위로 가능</Text>
            <Text style={styles.infoText}>• 출금: 본인 명의 계좌만 가능</Text>
            <Text style={styles.infoText}>• 연결 서비스 수수료: 낙찰가의 3%</Text>
            <Text style={styles.infoText}>• 레벨별 할인 혜택: 10~40% 할인</Text>
          </View>
        </Card>

        {/* 사용 내역 */}
        <View style={styles.transactionSection}>
          <View style={styles.transactionHeader}>
            <Text style={styles.sectionTitle}>포인트 사용 내역</Text>
            <TouchableOpacity onPress={() => navigation.navigate('PointHistory')}>
              <Text style={styles.seeAllText}>전체보기</Text>
            </TouchableOpacity>
          </View>

          {transactions.slice(0, 5).map((transaction) => (
            <Card key={transaction.id} style={styles.transactionItem}>
              <View style={styles.transactionContent}>
                <Icon
                  name={getTransactionIcon(transaction.type)}
                  size={24}
                  color={getTransactionColor(transaction.type)}
                />
                <View style={styles.transactionDetails}>
                  <Text style={styles.transactionDescription}>
                    {transaction.description}
                  </Text>
                  <Text style={styles.transactionDate}>
                    {formatDate(transaction.createdAt)}
                  </Text>
                </View>
                <Text
                  style={[
                    styles.transactionAmount,
                    { color: getTransactionColor(transaction.type) },
                  ]}
                >
                  {transaction.amount > 0 ? '+' : ''}
                  {formatCurrency(Math.abs(transaction.amount))}원
                </Text>
              </View>
            </Card>
          ))}
        </View>
      </ScrollView>
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
  balanceCard: {
    padding: 24,
    marginBottom: 16,
    backgroundColor: 'white',
  },
  balanceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  balanceLabel: {
    fontSize: 16,
    color: '#666',
    marginLeft: 8,
  },
  balanceAmount: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 24,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 6,
  },
  chargeButton: {
    backgroundColor: '#FF6B6B',
  },
  withdrawButton: {
    backgroundColor: '#f0f0f0',
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  infoCard: {
    padding: 16,
    marginBottom: 24,
    backgroundColor: 'white',
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginLeft: 8,
  },
  infoContent: {
    gap: 6,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  transactionSection: {
    marginBottom: 32,
  },
  transactionHeader: {
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
  seeAllText: {
    fontSize: 14,
    color: '#FF6B6B',
  },
  transactionItem: {
    padding: 16,
    marginBottom: 8,
    backgroundColor: 'white',
  },
  transactionContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  transactionDetails: {
    flex: 1,
    marginLeft: 12,
  },
  transactionDescription: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 4,
  },
  transactionDate: {
    fontSize: 12,
    color: '#999',
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: '600',
  },
});

export default PointScreen;