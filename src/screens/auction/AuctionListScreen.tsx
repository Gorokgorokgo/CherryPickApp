/**
 * 경매 목록 조회 화면
 * 실제 API와 연동되는 완전한 기능 구현
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  RefreshControl,
  Modal,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';

import { AuctionCard } from '../../components/auction';
import { Loading, EmptyState, Button, Icon } from '../../components/common';
import { useDebounce } from '../../hooks/useDebounce';
import { apiService, type AuctionItem } from '../../services/api';
import { formatAuctionPrice, formatTimeLeft, calculateTimeRemaining } from '../../utils/auctionListUtils';
import { COLORS, SPACING, FONT_SIZES, CATEGORIES } from '../../constants';

const SORT_OPTIONS = [
  { value: 'CREATED_DESC', label: '최신순' },
  { value: 'PRICE_ASC', label: '낮은 가격순' },
  { value: 'PRICE_DESC', label: '높은 가격순' },
  { value: 'ENDING_SOON', label: '마감 임박순' },
  { value: 'BID_COUNT_DESC', label: '인기순' },
];

export default function AuctionListScreen() {
  const navigation = useNavigation();

  // 상태 관리
  const [auctions, setAuctions] = useState<AuctionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasNextPage, setHasNextPage] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);

  // 검색 및 필터 상태
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedSort, setSelectedSort] = useState('CREATED_DESC');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  
  // 모달 상태
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [sortModalVisible, setSortModalVisible] = useState(false);

  // 검색어 디바운싱
  const debouncedSearchQuery = useDebounce(searchQuery, 500);

  // 경매 목록 가져오기
  const fetchAuctions = useCallback(async (page: number = 0, isRefresh: boolean = false) => {
    try {
      if (!isRefresh && page === 0) setLoading(true);
      if (page > 0) setLoadingMore(true);

      let response;

      // 검색 조건이 있으면 통합 검색 API 사용
      if (debouncedSearchQuery || selectedCategory || minPrice || maxPrice) {
        const searchParams: any = {
          sortBy: selectedSort,
        };

        if (debouncedSearchQuery) searchParams.keyword = debouncedSearchQuery;
        if (selectedCategory) searchParams.category = selectedCategory;
        if (minPrice) searchParams.minPrice = parseInt(minPrice.replace(/,/g, ''));
        if (maxPrice) searchParams.maxPrice = parseInt(maxPrice.replace(/,/g, ''));

        response = await apiService.searchAuctions(searchParams, page, 20);
      } else {
        // 기본 목록 가져오기
        response = await apiService.getAuctions(page, 20);
      }

      const { content, last, totalElements } = response.data;

      if (page === 0 || isRefresh) {
        setAuctions(content);
      } else {
        setAuctions(prev => [...prev, ...content]);
      }

      setHasNextPage(!last && totalElements > (page + 1) * 20);
      setCurrentPage(page);

    } catch (error: any) {
      Alert.alert('오류', error.message || '경매 목록을 불러오는데 실패했습니다.');
      console.error('경매 목록 로딩 오류:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
      setLoadingMore(false);
    }
  }, [debouncedSearchQuery, selectedCategory, minPrice, maxPrice, selectedSort]);

  // 초기 로드 및 검색 조건 변경시 재로드
  useEffect(() => {
    fetchAuctions(0);
  }, [fetchAuctions]);

  // 이벤트 핸들러들
  const handleRefresh = () => {
    setRefreshing(true);
    fetchAuctions(0, true);
  };

  const handleLoadMore = () => {
    if (!loadingMore && hasNextPage && auctions.length > 0) {
      fetchAuctions(currentPage + 1);
    }
  };

  const handleAuctionPress = (auctionId: string) => {
    navigation.navigate('AuctionDetail', { auctionId: parseInt(auctionId) });
  };

  const handleSearch = () => {
    // 디바운싱된 검색어로 자동 검색됨
  };

  const clearFilters = () => {
    setSelectedCategory('');
    setMinPrice('');
    setMaxPrice('');
    setSearchQuery('');
  };

  const formatPriceInput = (text: string) => {
    const numericValue = text.replace(/[^0-9]/g, '');
    if (numericValue) {
      return parseInt(numericValue).toLocaleString();
    }
    return '';
  };

  const applyPriceFilter = () => {
    if (minPrice && maxPrice) {
      const min = parseInt(minPrice.replace(/,/g, ''));
      const max = parseInt(maxPrice.replace(/,/g, ''));
      
      if (min > max) {
        Alert.alert('오류', '최소 가격은 최대 가격보다 작아야 합니다.');
        return;
      }
    }
    setFilterModalVisible(false);
  };

  // 경매 아이템 렌더링
  const renderAuctionItem = ({ item }: { item: AuctionItem }) => {
    const timeRemaining = calculateTimeRemaining(item.endAt);
    const formattedTimeLeft = formatTimeLeft(timeRemaining.totalMs);
    
    return (
      <AuctionCard
        auction={{
          id: item.id.toString(),
          title: item.title,
          currentPrice: item.currentPrice,
          startPrice: item.startPrice,
          imageUrl: item.imageUrls[0],
          timeLeft: formattedTimeLeft,
          location: item.regionName,
          bidCount: item.bidCount,
          category: item.category,
          status: timeRemaining.totalMs > 0 ? 'active' : 'ended',
        }}
        onPress={handleAuctionPress}
        style={styles.auctionCard}
        showStatus={true}
      />
    );
  };

  const renderEmptyComponent = () => {
    if (loading) return null;
    
    return (
      <EmptyState
        icon="gavel"
        title="경매가 없습니다"
        description={searchQuery || selectedCategory ? '검색 조건을 바꿔보세요' : '새로운 경매가 곧 등록됩니다'}
      />
    );
  };

  const renderLoadingFooter = () => {
    if (!loadingMore) return null;
    return (
      <View style={styles.loadingFooter}>
        <Loading visible={true} overlay={false} size="small" />
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* 헤더 */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>경매 목록</Text>
      </View>

      {/* 검색 바 */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Icon name="search" size={20} color={COLORS.gray500} />
          <TextInput
            style={styles.searchInput}
            placeholder="상품명을 검색하세요"
            value={searchQuery}
            onChangeText={setSearchQuery}
            returnKeyType="search"
            onSubmitEditing={handleSearch}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Icon name="close" size={16} color={COLORS.gray500} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* 필터 및 정렬 */}
      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[styles.filterButton, selectedCategory && styles.filterButtonActive]}
          onPress={() => setFilterModalVisible(true)}
        >
          <Icon name="filter-list" size={16} color={selectedCategory ? COLORS.primary : COLORS.gray600} />
          <Text style={[styles.filterButtonText, selectedCategory && styles.filterButtonActiveText]}>
            {selectedCategory ? CATEGORIES.find(c => c.value.toUpperCase() === selectedCategory)?.label || '필터' : '필터'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setSortModalVisible(true)}
        >
          <Icon name="sort" size={16} color={COLORS.gray600} />
          <Text style={styles.filterButtonText}>
            {SORT_OPTIONS.find(s => s.value === selectedSort)?.label || '정렬'}
          </Text>
        </TouchableOpacity>

        {(selectedCategory || minPrice || maxPrice || searchQuery) && (
          <TouchableOpacity
            style={styles.clearButton}
            onPress={clearFilters}
          >
            <Text style={styles.clearButtonText}>초기화</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* 경매 목록 */}
      <FlatList
        data={auctions}
        renderItem={renderAuctionItem}
        keyExtractor={(item) => item.id.toString()}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
          />
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        ListEmptyComponent={renderEmptyComponent}
        ListFooterComponent={renderLoadingFooter}
      />

      {/* 필터 모달 */}
      <Modal
        visible={filterModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>필터</Text>
            <TouchableOpacity onPress={() => setFilterModalVisible(false)}>
              <Icon name="close" size={24} color={COLORS.textPrimary} />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.modalContent}>
            {/* 카테고리 필터 */}
            <View style={styles.filterSection}>
              <Text style={styles.filterTitle}>카테고리</Text>
              <TouchableOpacity
                style={[styles.categoryOption, !selectedCategory && styles.categoryOptionSelected]}
                onPress={() => setSelectedCategory('')}
              >
                <Text style={[styles.categoryOptionText, !selectedCategory && styles.categoryOptionSelectedText]}>
                  전체
                </Text>
              </TouchableOpacity>
              {CATEGORIES.map((category) => (
                <TouchableOpacity
                  key={category.value}
                  style={[styles.categoryOption, selectedCategory === category.value.toUpperCase() && styles.categoryOptionSelected]}
                  onPress={() => setSelectedCategory(category.value.toUpperCase())}
                >
                  <Text style={[styles.categoryOptionText, selectedCategory === category.value.toUpperCase() && styles.categoryOptionSelectedText]}>
                    {category.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* 가격 범위 필터 */}
            <View style={styles.filterSection}>
              <Text style={styles.filterTitle}>가격 범위</Text>
              <View style={styles.priceRangeContainer}>
                <TextInput
                  style={styles.priceInput}
                  placeholder="최소 가격"
                  value={minPrice}
                  onChangeText={(text) => setMinPrice(formatPriceInput(text))}
                  keyboardType="numeric"
                />
                <Text style={styles.priceRangeSeparator}>~</Text>
                <TextInput
                  style={styles.priceInput}
                  placeholder="최대 가격"
                  value={maxPrice}
                  onChangeText={(text) => setMaxPrice(formatPriceInput(text))}
                  keyboardType="numeric"
                />
              </View>
              <Button
                title="가격 필터 적용"
                onPress={applyPriceFilter}
                style={styles.applyButton}
              />
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* 정렬 모달 */}
      <Modal
        visible={sortModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>정렬</Text>
            <TouchableOpacity onPress={() => setSortModalVisible(false)}>
              <Icon name="close" size={24} color={COLORS.textPrimary} />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.modalContent}>
            {SORT_OPTIONS.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[styles.sortOption, selectedSort === option.value && styles.sortOptionSelected]}
                onPress={() => {
                  setSelectedSort(option.value);
                  setSortModalVisible(false);
                }}
              >
                <Text style={[styles.sortOptionText, selectedSort === option.value && styles.sortOptionSelectedText]}>
                  {option.label}
                </Text>
                {selectedSort === option.value && (
                  <Icon name="check" size={20} color={COLORS.primary} />
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* 로딩 오버레이 */}
      <Loading 
        visible={loading} 
        message="경매 목록을 불러오는 중..."
        overlay={true}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray200,
  },
  headerTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '600',
    color: COLORS.textPrimary,
    textAlign: 'center',
  },
  searchContainer: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.gray100,
    borderRadius: 8,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    gap: SPACING.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: FONT_SIZES.md,
    color: COLORS.textPrimary,
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    gap: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray200,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: 16,
    backgroundColor: COLORS.gray100,
    gap: 4,
  },
  filterButtonActive: {
    backgroundColor: COLORS.primary + '20',
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  filterButtonText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.gray600,
  },
  filterButtonActiveText: {
    color: COLORS.primary,
    fontWeight: '500',
  },
  clearButton: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: 16,
    backgroundColor: COLORS.gray200,
  },
  clearButtonText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  listContent: {
    padding: SPACING.md,
  },
  row: {
    justifyContent: 'space-between',
  },
  auctionCard: {
    width: '48%',
    marginBottom: SPACING.md,
  },
  loadingFooter: {
    paddingVertical: SPACING.md,
    alignItems: 'center',
  },

  // 모달 스타일
  modalContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray200,
  },
  modalTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: SPACING.md,
  },
  filterSection: {
    paddingVertical: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray200,
  },
  filterTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
  },
  categoryOption: {
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.md,
    borderRadius: 8,
    marginBottom: SPACING.xs,
  },
  categoryOptionSelected: {
    backgroundColor: COLORS.primary + '20',
  },
  categoryOptionText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textPrimary,
  },
  categoryOptionSelectedText: {
    color: COLORS.primary,
    fontWeight: '500',
  },
  priceRangeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  priceInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: COLORS.gray300,
    borderRadius: 8,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    fontSize: FONT_SIZES.md,
  },
  priceRangeSeparator: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
  },
  applyButton: {
    marginTop: SPACING.sm,
  },
  sortOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.md,
    borderRadius: 8,
    marginBottom: SPACING.xs,
  },
  sortOptionSelected: {
    backgroundColor: COLORS.primary + '20',
  },
  sortOptionText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textPrimary,
  },
  sortOptionSelectedText: {
    color: COLORS.primary,
    fontWeight: '500',
  },
});