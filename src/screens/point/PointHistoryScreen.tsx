import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Icon } from '../../components/common';
import Card from '../../components/common/Card';
import EmptyState from '../../components/common/EmptyState';
import { formatCurrency } from '../../utils/format';

interface PointTransaction {
  id: string;
  type: 'charge' | 'use' | 'refund' | 'withdraw';
  amount: number;
  description: string;
  detail?: string;
  createdAt: Date;
  status: 'completed' | 'pending' | 'failed' | 'cancelled';
  relatedId?: string; // 관련 경매 ID 등
}

interface PointHistoryScreenProps {
  navigation: any;
}

const PointHistoryScreen: React.FC<PointHistoryScreenProps> = ({ navigation }) => {
  const [transactions, setTransactions] = useState<PointTransaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<string>('all');

  const filters = [
    { key: 'all', label: '전체' },
    { key: 'charge', label: '충전' },
    { key: 'use', label: '사용' },
    { key: 'refund', label: '환불' },
    { key: 'withdraw', label: '출금' },
  ];

  // 샘플 데이터
  const sampleTransactions: PointTransaction[] = [
    {
      id: '10',
      type: 'charge',
      amount: 100000,
      description: '포인트 충전',
      detail: '신한카드 (*1234)',
      createdAt: new Date('2024-08-21 14:30'),
      status: 'completed',
    },
    {
      id: '9',
      type: 'use',
      amount: -15000,
      description: '연결 서비스 수수료',
      detail: '아이패드 Pro 경매',
      createdAt: new Date('2024-08-20 16:45'),
      status: 'completed',
      relatedId: 'auction_123',
    },
    {
      id: '8',
      type: 'refund',
      amount: 5000,
      description: '연결 서비스 수수료 할인',
      detail: '레벨 3 할인 혜택 (10%)',
      createdAt: new Date('2024-08-20 16:46'),
      status: 'completed',
    },
    {
      id: '7',
      type: 'use',
      amount: -12000,
      description: '연결 서비스 수수료',
      detail: '갤럭시 워치 경매',
      createdAt: new Date('2024-08-19 12:20'),
      status: 'completed',
      relatedId: 'auction_122',
    },
    {
      id: '6',
      type: 'charge',
      amount: 50000,
      description: '포인트 충전',
      detail: '국민은행 (***6789)',
      createdAt: new Date('2024-08-18 10:15'),
      status: 'completed',
    },
    {
      id: '5',
      type: 'withdraw',
      amount: -30000,
      description: '포인트 출금',
      detail: '국민은행 (***6789)',
      createdAt: new Date('2024-08-17 15:30'),
      status: 'completed',
    },
    {
      id: '4',
      type: 'use',
      amount: -8100,
      description: '연결 서비스 수수료',
      detail: '무선 이어폰 경매',
      createdAt: new Date('2024-08-16 18:45'),
      status: 'completed',
      relatedId: 'auction_121',
    },
    {
      id: '3',
      type: 'charge',
      amount: 20000,
      description: '포인트 충전',
      detail: '신한카드 (*1234)',
      createdAt: new Date('2024-08-15 11:20'),
      status: 'completed',
    },
    {
      id: '2',
      type: 'withdraw',
      amount: -25000,
      description: '포인트 출금',
      detail: '신한은행 (***1234)',
      createdAt: new Date('2024-08-14 14:10'),
      status: 'pending',
    },
    {
      id: '1',
      type: 'charge',
      amount: 100000,
      description: '포인트 충전',
      detail: '카카오페이',
      createdAt: new Date('2024-08-13 09:30'),
      status: 'completed',
    },
  ];

  useEffect(() => {
    loadTransactions();
  }, [selectedFilter]);

  const loadTransactions = async () => {
    setLoading(true);
    try {
      // TODO: API 호출
      await new Promise<void>(resolve => setTimeout(() => resolve(), 1000));
      
      let filteredData = sampleTransactions;
      if (selectedFilter !== 'all') {
        filteredData = sampleTransactions.filter(t => t.type === selectedFilter);
      }
      
      setTransactions(filteredData);
    } catch (error) {
      console.error('거래 내역 로드 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadTransactions();
    setRefreshing(false);
  };

  const getTransactionIcon = (type: string, status: string) => {
    if (status === 'pending') return 'schedule';
    if (status === 'failed' || status === 'cancelled') return 'error-outline';
    
    switch (type) {
      case 'charge':
        return 'add-circle';
      case 'use':
        return 'remove-circle';
      case 'refund':
        return 'refresh';
      case 'withdraw':
        return 'credit-card';
      default:
        return 'help-outline';
    }
  };

  const getTransactionColor = (type: string, status: string) => {
    if (status === 'pending') return '#FF9800';
    if (status === 'failed' || status === 'cancelled') return '#F44336';
    
    switch (type) {
      case 'charge':
      case 'refund':
        return '#4CAF50';
      case 'use':
      case 'withdraw':
        return '#F44336';
      default:
        return '#999999';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return '완료';
      case 'pending':
        return '처리중';
      case 'failed':
        return '실패';
      case 'cancelled':
        return '취소';
      default:
        return status;
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

  const handleTransactionPress = (transaction: PointTransaction) => {
    if (transaction.relatedId) {
      navigation.navigate('AuctionDetail', { auctionId: transaction.relatedId });
    }
  };

  const renderFilterButton = (filter: { key: string; label: string }) => (
    <TouchableOpacity
      key={filter.key}
      style={[
        styles.filterButton,
        selectedFilter === filter.key && styles.selectedFilterButton,
      ]}
      onPress={() => setSelectedFilter(filter.key)}
    >
      <Text
        style={[
          styles.filterButtonText,
          selectedFilter === filter.key && styles.selectedFilterButtonText,
        ]}
      >
        {filter.label}
      </Text>
    </TouchableOpacity>
  );

  const renderTransaction = ({ item }: { item: PointTransaction }) => (
    <TouchableOpacity
      style={styles.transactionItem}
      onPress={() => handleTransactionPress(item)}
      disabled={!item.relatedId}
    >
      <Card style={styles.transactionCard}>
        <View style={styles.transactionContent}>
          <Icon
            name={getTransactionIcon(item.type, item.status)}
            size={24}
            color={getTransactionColor(item.type, item.status)}
          />
          <View style={styles.transactionDetails}>
            <View style={styles.transactionHeader}>
              <Text style={styles.transactionDescription}>
                {item.description}
              </Text>
              {item.status !== 'completed' && (
                <Text style={[
                  styles.statusBadge,
                  { color: getTransactionColor(item.type, item.status) }
                ]}>
                  {getStatusText(item.status)}
                </Text>
              )}
            </View>
            <Text style={styles.transactionDetail}>{item.detail}</Text>
            <Text style={styles.transactionDate}>
              {formatDate(item.createdAt)}
            </Text>
          </View>
          <View style={styles.transactionAmountContainer}>
            <Text
              style={[
                styles.transactionAmount,
                { color: getTransactionColor(item.type, item.status) },
              ]}
            >
              {item.amount > 0 ? '+' : ''}
              {formatCurrency(Math.abs(item.amount))}원
            </Text>
            {item.relatedId && (
              <Icon name="chevron-right" size={16} color="#ccc" />
            )}
          </View>
        </View>
      </Card>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>포인트 사용 내역</Text>
        <View style={styles.headerRight} />
      </View>

      <View style={styles.filterContainer}>
        {filters.map(renderFilterButton)}
      </View>

      <View style={styles.content}>
        {transactions.length === 0 ? (
          <EmptyState
            icon="receipt-long"
            title="포인트 사용 내역이 없습니다"
            subtitle="포인트를 충전하거나 사용하면 내역이 표시됩니다"
          />
        ) : (
          <FlatList
            data={transactions}
            renderItem={renderTransaction}
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
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    gap: 8,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: 'white',
  },
  selectedFilterButton: {
    borderColor: '#FF6B6B',
    backgroundColor: '#FFF5F5',
  },
  filterButtonText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  selectedFilterButtonText: {
    color: '#FF6B6B',
  },
  content: {
    flex: 1,
  },
  listContainer: {
    padding: 16,
  },
  transactionItem: {
    marginBottom: 8,
  },
  transactionCard: {
    padding: 16,
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
  transactionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  transactionDescription: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    flex: 1,
  },
  statusBadge: {
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 8,
  },
  transactionDetail: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  transactionDate: {
    fontSize: 12,
    color: '#999',
  },
  transactionAmountContainer: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: '600',
    marginRight: 4,
  },
});

export default PointHistoryScreen;