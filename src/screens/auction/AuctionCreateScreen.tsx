import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  Alert,
  Modal,
  FlatList,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { RootStackParamList } from '../../navigation/AppNavigator';
import { Icon } from '../../components/common';

type AuctionCreateScreenNavigationProp = StackNavigationProp<RootStackParamList>;

interface AuctionFormData {
  title: string;
  description: string;
  category: string;
  startPrice: string;
  buyNowPrice: string;
  duration: string;
  condition: number;
  purchaseDate: string;
  images: string[];
}

const CATEGORIES = [
  '전자제품', '패션', '생활용품', '스포츠/레저', 
  '도서/음반', '가구/인테리어', '유아용품', '기타'
];

const DURATIONS = [
  { label: '3시간', value: '3h' },
  { label: '6시간', value: '6h' },
  { label: '12시간', value: '12h' },
  { label: '24시간', value: '24h' },
  { label: '48시간', value: '48h' },
  { label: '72시간', value: '72h' },
];

export default function AuctionCreateScreen() {
  const navigation = useNavigation<AuctionCreateScreenNavigationProp>();
  const insets = useSafeAreaInsets();
  const [formData, setFormData] = useState<AuctionFormData>({
    title: '',
    description: '',
    category: '',
    startPrice: '',
    buyNowPrice: '',
    duration: '24h',
    condition: 10,
    purchaseDate: '',
    images: [],
  });
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [loading, setLoading] = useState(false);

  const updateFormData = (field: keyof AuctionFormData, value: string | string[] | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateForm = (): boolean => {
    return formData.title.trim() !== '' && 
           formData.description.trim() !== '' &&
           formData.category !== '' &&
           formData.startPrice !== '' &&
           formData.images.length >= 1;
  };

  const handleImageAdd = () => {
    // TODO: 이미지 선택 로직
    Alert.alert('개발 중', '이미지 선택 기능을 구현 예정입니다.');
  };

  const handleImageRemove = (index: number) => {
    const newImages = formData.images.filter((_, i) => i !== index);
    updateFormData('images', newImages);
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      Alert.alert('알림', '모든 필수 항목을 입력해주세요.\n(제목, 설명, 카테고리, 시작가, 사진 최소 1장)');
      return;
    }

    setLoading(true);
    try {
      // TODO: API 호출
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      Alert.alert('성공', '경매가 등록되었습니다!', [
        { text: '확인', onPress: () => navigation.goBack() }
      ]);
    } catch (error) {
      Alert.alert('오류', '경매 등록에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: string) => {
    if (!price) return '';
    return parseInt(price.replace(/,/g, '')).toLocaleString();
  };

  const handlePriceChange = (field: 'startPrice' | 'buyNowPrice', value: string) => {
    const numericValue = value.replace(/[^0-9]/g, '');
    updateFormData(field, numericValue);
  };

  const renderImageUpload = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>상품 사진 업로드 <Text style={styles.required}>(최소 3장)</Text></Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imageContainer}>
        {/* 이미지 추가 버튼 */}
        <TouchableOpacity style={styles.imageAddButton} onPress={handleImageAdd}>
          <Icon name="add-a-photo" size={40} color="#999999" />
          <Text style={styles.imageAddText}>{formData.images.length}/10</Text>
        </TouchableOpacity>
        
        {/* 업로드된 이미지들 */}
        {formData.images.map((image, index) => (
          <View key={index} style={styles.imageWrapper}>
            <Image source={{ uri: image }} style={styles.uploadedImage} />
            <TouchableOpacity 
              style={styles.imageRemoveButton}
              onPress={() => handleImageRemove(index)}
            >
              <Icon name="close" size={16} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>
    </View>
  );

  const renderDurationButtons = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>경매 시간 <Text style={styles.required}>*</Text></Text>
      <View style={styles.durationGrid}>
        {DURATIONS.map((duration) => (
          <TouchableOpacity
            key={duration.value}
            style={[
              styles.durationButton,
              formData.duration === duration.value && styles.durationButtonActive
            ]}
            onPress={() => updateFormData('duration', duration.value)}
          >
            <Text style={[
              styles.durationButtonText,
              formData.duration === duration.value && styles.durationButtonTextActive
            ]}>
              {duration.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderConditionSlider = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>상태 (1~10)</Text>
      <Text style={styles.conditionDescription}>상품 품질을 입력해주세요</Text>
      <View style={styles.conditionContainer}>
        <Text style={styles.conditionLabel}>1</Text>
        <View style={styles.conditionSliderContainer}>
          {Array.from({ length: 10 }, (_, i) => i + 1).map((value) => (
            <TouchableOpacity
              key={value}
              style={[
                styles.conditionDot,
                formData.condition >= value && styles.conditionDotActive
              ]}
              onPress={() => updateFormData('condition', value)}
            />
          ))}
        </View>
        <Text style={styles.conditionLabel}>10</Text>
        <View style={styles.conditionValueContainer}>
          <View style={styles.conditionValueCircle}>
            <Text style={styles.conditionValue}>{formData.condition}</Text>
          </View>
        </View>
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color="#333333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>경매 등록</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* 이미지 업로드 */}
        {renderImageUpload()}

        {/* 제목 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>제목 <Text style={styles.required}>*</Text></Text>
          <TextInput
            style={styles.textInput}
            placeholder="상품 이름을 입력하세요"
            value={formData.title}
            onChangeText={(text) => updateFormData('title', text)}
            maxLength={50}
          />
        </View>

        {/* 상품 설명 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>상품 설명 <Text style={styles.required}>*</Text></Text>
          <TextInput
            style={[styles.textInput, styles.textArea]}
            placeholder="상세 내용을 입력하세요"
            value={formData.description}
            onChangeText={(text) => updateFormData('description', text)}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>

        {/* 카테고리 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>카테고리 <Text style={styles.required}>*</Text></Text>
          <TouchableOpacity
            style={styles.selectButton}
            onPress={() => setShowCategoryModal(true)}
          >
            <Text style={[
              styles.selectButtonText,
              formData.category && styles.selectButtonTextSelected
            ]}>
              {formData.category || '카테고리 선택'}
            </Text>
            <Icon name="keyboard-arrow-down" size={24} color="#999999" />
          </TouchableOpacity>
        </View>

        {/* 시작가 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>시작가 <Text style={styles.required}>*</Text></Text>
          <View style={styles.priceInputContainer}>
            <TextInput
              style={styles.priceInput}
              placeholder="가격을 입력하세요"
              value={formatPrice(formData.startPrice)}
              onChangeText={(text) => handlePriceChange('startPrice', text)}
              keyboardType="numeric"
            />
            <Text style={styles.priceUnit}>원</Text>
          </View>
        </View>

        {/* 희망가 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>희망가</Text>
          <View style={styles.priceInputContainer}>
            <TextInput
              style={styles.priceInput}
              placeholder="희망구매 가격 (선택)"
              value={formatPrice(formData.buyNowPrice)}
              onChangeText={(text) => handlePriceChange('buyNowPrice', text)}
              keyboardType="numeric"
            />
            <Text style={styles.priceUnit}>원</Text>
          </View>
        </View>

        {/* 경매 시간 */}
        {renderDurationButtons()}

        {/* 구매일 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>구매일 (1~10)</Text>
          <Text style={styles.reviewDescription}>상품을 구매한지 얼마나 되셨나요</Text>
          
          <View style={styles.dateInputContainer}>
            <TextInput
              style={styles.dateInput}
              placeholder="예: 2024년 3월 15일, 3개월 전, 작년 겨울 등"
              value={formData.purchaseDate}
              onChangeText={(text) => updateFormData('purchaseDate', text)}
              multiline
              numberOfLines={2}
              textAlignVertical="top"
            />
          </View>
          
          <View style={styles.tipContainer}>
            <Icon name="lightbulb" size={16} color="#FFA500" />
            <Text style={styles.tipText}>
              팁 : 정확한 날짜를 입력할 수록 입찰률이 올라갑니다!
            </Text>
          </View>
        </View>

        {/* 상태 슬라이더 */}
        {renderConditionSlider()}

      </ScrollView>

      {/* 하단 버튼 */}
      <View style={styles.bottomButtons}>
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.cancelButtonText}>취소</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.submitButton, loading && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={loading}
        >
          <Text style={styles.submitButtonText}>
            {loading ? '등록 중...' : '경매 등록하기'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* 카테고리 선택 모달 */}
      <Modal
        visible={showCategoryModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowCategoryModal(false)}>
              <Icon name="close" size={24} color="#333333" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>카테고리 선택</Text>
            <View style={{ width: 24 }} />
          </View>
          
          <FlatList
            data={CATEGORIES}
            keyExtractor={(item) => item}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.categoryOption}
                onPress={() => {
                  updateFormData('category', item);
                  setShowCategoryModal(false);
                }}
              >
                <Text style={styles.categoryOptionText}>{item}</Text>
                {formData.category === item && (
                  <Icon name="check" size={20} color="#FF6B6B" />
                )}
              </TouchableOpacity>
            )}
          />
        </View>
      </Modal>
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
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
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
  required: {
    color: '#FF6B6B',
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: '#FAFAFA',
  },
  textArea: {
    height: 100,
    paddingTop: 12,
  },
  selectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FAFAFA',
  },
  selectButtonText: {
    fontSize: 16,
    color: '#999999',
  },
  selectButtonTextSelected: {
    color: '#333333',
  },
  priceInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    backgroundColor: '#FAFAFA',
  },
  priceInput: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    textAlign: 'right',
  },
  priceUnit: {
    paddingRight: 16,
    fontSize: 16,
    color: '#666666',
  },
  // 이미지 업로드
  imageContainer: {
    flexDirection: 'row',
  },
  imageAddButton: {
    width: 100,
    height: 100,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    borderStyle: 'dashed',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    backgroundColor: '#FAFAFA',
  },
  imageAddText: {
    fontSize: 12,
    color: '#999999',
    marginTop: 4,
  },
  imageWrapper: {
    position: 'relative',
    marginRight: 12,
  },
  uploadedImage: {
    width: 100,
    height: 100,
    borderRadius: 8,
  },
  imageRemoveButton: {
    position: 'absolute',
    top: -5,
    right: -5,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#FF6B6B',
    justifyContent: 'center',
    alignItems: 'center',
  },
  // 경매 시간
  durationGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -6,
  },
  durationButton: {
    width: '30%',
    margin: 6,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    alignItems: 'center',
    backgroundColor: '#FAFAFA',
  },
  durationButtonActive: {
    borderColor: '#FF6B6B',
    backgroundColor: '#FFF5F5',
  },
  durationButtonText: {
    fontSize: 14,
    color: '#666666',
  },
  durationButtonTextActive: {
    color: '#FF6B6B',
    fontWeight: '600',
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
  conditionSliderContainer: {
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
  // 구매일
  reviewDescription: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 16,
  },
  dateInputContainer: {
    marginBottom: 12,
  },
  dateInput: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 14,
    backgroundColor: '#FAFAFA',
    height: 60,
    textAlignVertical: 'center',
  },
  tipContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FFF9E6',
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#FFA500',
    marginBottom: 8,
  },
  tipText: {
    fontSize: 13,
    color: '#8B6914',
    marginLeft: 8,
    flex: 1,
    lineHeight: 18,
  },
  // 하단 버튼
  bottomButtons: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    backgroundColor: '#FFFFFF',
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 16,
    marginRight: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#666666',
    fontWeight: '500',
  },
  submitButton: {
    flex: 2,
    paddingVertical: 16,
    borderRadius: 8,
    backgroundColor: '#FF6B6B',
    alignItems: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: '#CCCCCC',
  },
  submitButtonText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  // 모달
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
  categoryOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F8F8F8',
  },
  categoryOptionText: {
    fontSize: 16,
    color: '#333333',
  },
});