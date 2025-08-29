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
import { launchImageLibrary, ImagePickerResponse, MediaType } from 'react-native-image-picker';
import { RootStackParamList } from '../../navigation/AppNavigator';
import { Icon } from '../../components/common';
import { apiService, CreateAuctionRequest } from '../../services/api';
import { formatPrice } from '../../utils/auctionUtils';
import { CATEGORIES } from '../../constants';

type AuctionCreateScreenNavigationProp = StackNavigationProp<RootStackParamList>;

interface AuctionFormData {
  title: string;
  description: string;
  category: string;
  startPrice: string;
  hopePrice: string;
  auctionTimeHours: number;
  regionScope: string;
  regionCode: string;
  regionName: string;
  images: string[];
  purchaseDate: string;
  condition: number;
}

// 백엔드 Enum에 맞는 카테고리 매핑
const BACKEND_CATEGORIES = [
  { label: '전자제품', value: 'ELECTRONICS' },
  { label: '의류', value: 'CLOTHING' },
  { label: '도서', value: 'BOOKS' },
  { label: '가구', value: 'FURNITURE' },
  { label: '스포츠용품', value: 'SPORTS' },
  { label: '끼티', value: 'BEAUTY' },
  { label: '생활용품', value: 'HOME' },
  { label: '기타', value: 'OTHER' },
];

const DURATIONS = [
  { label: '3시간', value: 3 },
  { label: '6시간', value: 6 },
  { label: '12시간', value: 12 },
  { label: '24시간', value: 24 },
  { label: '48시간', value: 48 },
  { label: '72시간', value: 72 },
];

const REGION_SCOPES = [
  { label: '동네 (3km)', value: 'NEIGHBORHOOD' },
  { label: '시/군/구 (20km)', value: 'CITY' },
  { label: '전국', value: 'NATIONWIDE' },
];

export default function AuctionCreateScreen() {
  const navigation = useNavigation<AuctionCreateScreenNavigationProp>();
  const insets = useSafeAreaInsets();
  const [formData, setFormData] = useState<AuctionFormData>({
    title: '',
    description: '',
    category: '',
    startPrice: '',
    hopePrice: '',
    auctionTimeHours: 24,
    regionScope: 'CITY',
    regionCode: '11',
    regionName: '서울특별시',
    images: [],
    purchaseDate: '',
    condition: 8,
  });
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [loading, setLoading] = useState(false);

  const updateFormData = (field: keyof AuctionFormData, value: string | string[] | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateForm = (): { isValid: boolean; error?: string } => {
    if (!formData.title.trim()) {
      return { isValid: false, error: '제목을 입력해주세요.' };
    }
    if (formData.title.length > 100) {
      return { isValid: false, error: '제목은 100자를 넘을 수 없습니다.' };
    }
    if (!formData.description.trim()) {
      return { isValid: false, error: '상품 설명을 입력해주세요.' };
    }
    if (formData.description.length > 2000) {
      return { isValid: false, error: '상품 설명은 2000자를 넘을 수 없습니다.' };
    }
    if (!formData.category) {
      return { isValid: false, error: '카테고리를 선택해주세요.' };
    }
    if (!formData.startPrice) {
      return { isValid: false, error: '시작가를 입력해주세요.' };
    }
    if (!formData.hopePrice) {
      return { isValid: false, error: '희망가를 입력해주세요.' };
    }
    
    const startPrice = parseInt(formData.startPrice.replace(/,/g, '') || '0');
    const hopePrice = parseInt(formData.hopePrice.replace(/,/g, '') || '0');
    
    if (startPrice < 100) {
      return { isValid: false, error: '시작가는 최소 100원입니다.' };
    }
    if (hopePrice < 100) {
      return { isValid: false, error: '희망가는 최소 100원입니다.' };
    }
    if (startPrice > hopePrice) {
      return { isValid: false, error: '시작가는 희망가보다 클 수 없습니다.' };
    }
    if (startPrice % 100 !== 0) {
      return { isValid: false, error: '시작가는 100원 단위로 설정해주세요.' };
    }
    if (hopePrice % 100 !== 0) {
      return { isValid: false, error: '희망가는 100원 단위로 설정해주세요.' };
    }
    if (formData.images.length === 0) {
      return { isValid: false, error: '상품 이미지는 최소 1개 이상 필요합니다.' };
    }
    if (formData.images.length > 10) {
      return { isValid: false, error: '상품 이미지는 최대 10개까지 업로드할 수 있습니다.' };
    }
    
    return { isValid: true };
  };

  const handleImageAdd = () => {
    // 개발용: 에뮬레이터에서 테스트할 수 있도록 목업 이미지 추가
    if (__DEV__) {
      const mockImages = [
        'https://picsum.photos/400/400?random=1',
        'https://picsum.photos/400/400?random=2',
        'https://picsum.photos/400/400?random=3',
      ];
      const randomImage = mockImages[Math.floor(Math.random() * mockImages.length)];
      updateFormData('images', [...formData.images, randomImage]);
      return;
    }

    const options = {
      mediaType: 'photo' as MediaType,
      includeBase64: false,
      maxHeight: 2000,
      maxWidth: 2000,
      quality: 0.8,
      selectionLimit: 10 - formData.images.length,
    };

    launchImageLibrary(options, (response: ImagePickerResponse) => {
      if (response.didCancel || response.errorMessage) {
        return;
      }

      if (response.assets && response.assets.length > 0) {
        const newImages = response.assets.map(asset => asset.uri!).filter(Boolean);
        updateFormData('images', [...formData.images, ...newImages]);
      }
    });
  };

  const handleImageRemove = (index: number) => {
    const newImages = formData.images.filter((_, i) => i !== index);
    updateFormData('images', newImages);
  };

  const handleSubmit = async () => {
    if (loading) return;
    
    const validation = validateForm();
    if (!validation.isValid) {
      Alert.alert('오류', validation.error!);
      return;
    }

    setLoading(true);
    try {
      const requestData: CreateAuctionRequest = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        category: formData.category,
        startPrice: parseInt(formData.startPrice.replace(/,/g, '')),
        hopePrice: parseInt(formData.hopePrice.replace(/,/g, '')),
        auctionTimeHours: formData.auctionTimeHours,
        regionScope: formData.regionScope,
        regionCode: formData.regionCode,
        regionName: formData.regionName,
        imageUrls: formData.images,
      };
      
      const response = await apiService.createAuction(requestData);
      
      Alert.alert('성공', '경매가 등록되었습니다!', [
        { 
          text: '확인', 
          onPress: () => {
            // 경매 목록 새로고침을 위해 파라미터 전달
            navigation.navigate('Home', { refresh: true });
          }
        }
      ]);
    } catch (error: any) {
      Alert.alert('오류', error.message || '경매 등록에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: string) => {
    if (!price) return '';
    return parseInt(price.replace(/,/g, '')).toLocaleString();
  };

  const handlePriceChange = (field: 'startPrice' | 'hopePrice', value: string) => {
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
          <Text style={styles.imageAddText}>사진 추가</Text>
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
              formData.auctionTimeHours === duration.value && styles.durationButtonActive
            ]}
            onPress={() => updateFormData('auctionTimeHours', duration.value)}
          >
            <Text style={[
              styles.durationButtonText,
              formData.auctionTimeHours === duration.value && styles.durationButtonTextActive
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
              {BACKEND_CATEGORIES.find(cat => cat.value === formData.category)?.label || '카테고리 선택'}
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
              value={formatPrice(formData.hopePrice)}
              onChangeText={(text) => handlePriceChange('hopePrice', text)}
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
            data={BACKEND_CATEGORIES}
            keyExtractor={(item) => item.value}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.categoryOption}
                onPress={() => {
                  updateFormData('category', item.value);
                  setShowCategoryModal(false);
                }}
              >
                <Text style={styles.categoryOptionText}>{item.label}</Text>
                {formData.category === item.value && (
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
    paddingBottom: 34,
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