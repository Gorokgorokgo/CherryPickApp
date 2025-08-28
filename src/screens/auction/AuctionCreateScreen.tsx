import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Image,
  Alert,
  Modal,
  FlatList,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
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
  condition: string;
  location: string;
  images: string[];
}

const CATEGORIES = [
  '전자제품', '패션', '생활용품', '스포츠/레저', 
  '도서/음반', '가구/인테리어', '유아용품', '기타'
];

const CONDITIONS = [
  '새상품', '거의 새것', '사용감 있음', '낡음'
];

const DURATIONS = [
  { label: '1일', value: '1' },
  { label: '3일', value: '3' },
  { label: '5일', value: '5' },
  { label: '7일', value: '7' },
];

export default function AuctionCreateScreen() {
  const navigation = useNavigation<AuctionCreateScreenNavigationProp>();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<AuctionFormData>({
    title: '',
    description: '',
    category: '',
    startPrice: '',
    buyNowPrice: '',
    duration: '3',
    condition: '',
    location: '',
    images: [],
  });
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showConditionModal, setShowConditionModal] = useState(false);
  const [loading, setLoading] = useState(false);

  const updateFormData = (field: keyof AuctionFormData, value: string | string[]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        return formData.title.trim() !== '' && 
               formData.description.trim() !== '' &&
               formData.category !== '';
      case 2:
        return formData.startPrice !== '' && 
               formData.duration !== '' &&
               formData.condition !== '';
      case 3:
        return formData.location.trim() !== '';
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (!validateStep(currentStep)) {
      Alert.alert('알림', '모든 필수 항목을 입력해주세요.');
      return;
    }
    setCurrentStep(prev => prev + 1);
  };

  const handlePrevious = () => {
    setCurrentStep(prev => prev - 1);
  };

  const handleSubmit = async () => {
    if (!validateStep(3)) {
      Alert.alert('알림', '모든 필수 항목을 입력해주세요.');
      return;
    }

    setLoading(true);
    try {
      // TODO: 실제 API 호출
      await new Promise<void>((resolve) => setTimeout(() => resolve(), 1500));
      
      Alert.alert(
        '등록 완료',
        '경매가 성공적으로 등록되었습니다.',
        [
          {
            text: '확인',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error) {
      Alert.alert('오류', '등록 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const addImage = () => {
    // TODO: 이미지 선택 로직 구현
    Alert.alert('안내', '이미지 선택 기능은 추후 구현됩니다.');
  };

  const renderStepIndicator = () => (
    <View style={styles.stepIndicator}>
      {[1, 2, 3].map(step => (
        <View key={step} style={styles.stepContainer}>
          <View style={[
            styles.stepCircle,
            currentStep >= step && styles.stepCircleActive
          ]}>
            <Text style={[
              styles.stepNumber,
              currentStep >= step && styles.stepNumberActive
            ]}>
              {step}
            </Text>
          </View>
          {step < 3 && (
            <View style={[
              styles.stepLine,
              currentStep > step && styles.stepLineActive
            ]} />
          )}
        </View>
      ))}
    </View>
  );

  const renderStep1 = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>상품 정보</Text>
      
      <View style={styles.inputContainer}>
        <Text style={styles.label}>제목 *</Text>
        <TextInput
          style={styles.input}
          placeholder="상품 제목을 입력하세요"
          value={formData.title}
          onChangeText={(value) => updateFormData('title', value)}
          maxLength={50}
        />
        <Text style={styles.charCount}>{formData.title.length}/50</Text>
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>설명 *</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="상품에 대한 자세한 설명을 입력하세요"
          value={formData.description}
          onChangeText={(value) => updateFormData('description', value)}
          multiline
          numberOfLines={4}
          maxLength={500}
        />
        <Text style={styles.charCount}>{formData.description.length}/500</Text>
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>카테고리 *</Text>
        <TouchableOpacity
          style={styles.selectButton}
          onPress={() => setShowCategoryModal(true)}
        >
          <Text style={[
            styles.selectButtonText,
            formData.category && styles.selectButtonTextSelected
          ]}>
            {formData.category || '카테고리를 선택하세요'}
          </Text>
          <Icon name="keyboard-arrow-down" size={24} color="#666666" />
        </TouchableOpacity>
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>상품 이미지</Text>
        <TouchableOpacity style={styles.imageUploadButton} onPress={addImage}>
          <Icon name="add-a-photo" size={32} color="#999999" />
          <Text style={styles.imageUploadText}>이미지 추가</Text>
          <Text style={styles.imageUploadSubtext}>최대 10장까지 등록 가능</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderStep2 = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>경매 설정</Text>
      
      <View style={styles.inputContainer}>
        <Text style={styles.label}>시작 가격 *</Text>
        <TextInput
          style={styles.input}
          placeholder="0"
          value={formData.startPrice}
          onChangeText={(value) => updateFormData('startPrice', value.replace(/[^0-9]/g, ''))}
          keyboardType="numeric"
        />
        <Text style={styles.inputSuffix}>원</Text>
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>즉시 구매가</Text>
        <TextInput
          style={styles.input}
          placeholder="0 (선택사항)"
          value={formData.buyNowPrice}
          onChangeText={(value) => updateFormData('buyNowPrice', value.replace(/[^0-9]/g, ''))}
          keyboardType="numeric"
        />
        <Text style={styles.inputSuffix}>원</Text>
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>경매 기간 *</Text>
        <View style={styles.durationContainer}>
          {DURATIONS.map(duration => (
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

      <View style={styles.inputContainer}>
        <Text style={styles.label}>상품 상태 *</Text>
        <TouchableOpacity
          style={styles.selectButton}
          onPress={() => setShowConditionModal(true)}
        >
          <Text style={[
            styles.selectButtonText,
            formData.condition && styles.selectButtonTextSelected
          ]}>
            {formData.condition || '상품 상태를 선택하세요'}
          </Text>
          <Icon name="keyboard-arrow-down" size={24} color="#666666" />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderStep3 = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>거래 정보</Text>
      
      <View style={styles.inputContainer}>
        <Text style={styles.label}>거래 지역 *</Text>
        <TextInput
          style={styles.input}
          placeholder="예: 서울시 강남구"
          value={formData.location}
          onChangeText={(value) => updateFormData('location', value)}
        />
      </View>

      <View style={styles.summaryContainer}>
        <Text style={styles.summaryTitle}>등록 내용 확인</Text>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>제목:</Text>
          <Text style={styles.summaryValue}>{formData.title}</Text>
        </View>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>카테고리:</Text>
          <Text style={styles.summaryValue}>{formData.category}</Text>
        </View>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>시작가:</Text>
          <Text style={styles.summaryValue}>{Number(formData.startPrice).toLocaleString()}원</Text>
        </View>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>경매 기간:</Text>
          <Text style={styles.summaryValue}>{formData.duration}일</Text>
        </View>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>상품 상태:</Text>
          <Text style={styles.summaryValue}>{formData.condition}</Text>
        </View>
      </View>
    </View>
  );

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1: return renderStep1();
      case 2: return renderStep2();
      case 3: return renderStep3();
      default: return null;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color="#333333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>경매 등록</Text>
        <View style={{ width: 24 }} />
      </View>

      {renderStepIndicator()}

      <ScrollView style={styles.content}>
        {renderCurrentStep()}
      </ScrollView>

      <View style={styles.bottomButtons}>
        {currentStep > 1 && (
          <TouchableOpacity
            style={[styles.button, styles.previousButton]}
            onPress={handlePrevious}
          >
            <Text style={styles.previousButtonText}>이전</Text>
          </TouchableOpacity>
        )}
        
        <TouchableOpacity
          style={[
            styles.button,
            styles.nextButton,
            currentStep === 1 && styles.buttonFullWidth
          ]}
          onPress={currentStep === 3 ? handleSubmit : handleNext}
          disabled={loading}
        >
          <Text style={styles.nextButtonText}>
            {loading ? '등록 중...' : currentStep === 3 ? '등록하기' : '다음'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* 카테고리 선택 모달 */}
      <Modal
        visible={showCategoryModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowCategoryModal(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
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
                style={styles.optionItem}
                onPress={() => {
                  updateFormData('category', item);
                  setShowCategoryModal(false);
                }}
              >
                <Text style={styles.optionText}>{item}</Text>
                {formData.category === item && (
                  <Icon name="check" size={20} color="#FF6B6B" />
                )}
              </TouchableOpacity>
            )}
          />
        </SafeAreaView>
      </Modal>

      {/* 상품 상태 선택 모달 */}
      <Modal
        visible={showConditionModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowConditionModal(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowConditionModal(false)}>
              <Icon name="close" size={24} color="#333333" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>상품 상태 선택</Text>
            <View style={{ width: 24 }} />
          </View>
          
          <FlatList
            data={CONDITIONS}
            keyExtractor={(item) => item}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.optionItem}
                onPress={() => {
                  updateFormData('condition', item);
                  setShowConditionModal(false);
                }}
              >
                <Text style={styles.optionText}>{item}</Text>
                {formData.condition === item && (
                  <Icon name="check" size={20} color="#FF6B6B" />
                )}
              </TouchableOpacity>
            )}
          />
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
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
  stepIndicator: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
    backgroundColor: '#F8F8F8',
  },
  stepContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stepCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E0E0E0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepCircleActive: {
    backgroundColor: '#FF6B6B',
  },
  stepNumber: {
    fontSize: 14,
    fontWeight: '600',
    color: '#999999',
  },
  stepNumberActive: {
    color: '#FFFFFF',
  },
  stepLine: {
    width: 40,
    height: 2,
    backgroundColor: '#E0E0E0',
    marginHorizontal: 8,
  },
  stepLineActive: {
    backgroundColor: '#FF6B6B',
  },
  content: {
    flex: 1,
  },
  stepContent: {
    padding: 20,
  },
  stepTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 24,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 16,
    backgroundColor: '#FAFAFA',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  charCount: {
    fontSize: 12,
    color: '#999999',
    textAlign: 'right',
    marginTop: 4,
  },
  inputSuffix: {
    position: 'absolute',
    right: 16,
    top: 32,
    fontSize: 16,
    color: '#666666',
  },
  selectButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#FAFAFA',
  },
  selectButtonText: {
    fontSize: 16,
    color: '#999999',
  },
  selectButtonTextSelected: {
    color: '#333333',
  },
  durationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  durationButton: {
    flex: 1,
    paddingVertical: 12,
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    alignItems: 'center',
    backgroundColor: '#FAFAFA',
  },
  durationButtonActive: {
    borderColor: '#FF6B6B',
    backgroundColor: '#FF6B6B',
  },
  durationButtonText: {
    fontSize: 14,
    color: '#666666',
  },
  durationButtonTextActive: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  imageUploadButton: {
    borderWidth: 2,
    borderColor: '#E0E0E0',
    borderStyle: 'dashed',
    borderRadius: 8,
    paddingVertical: 40,
    alignItems: 'center',
    backgroundColor: '#FAFAFA',
  },
  imageUploadText: {
    fontSize: 16,
    color: '#666666',
    marginTop: 8,
  },
  imageUploadSubtext: {
    fontSize: 12,
    color: '#999999',
    marginTop: 4,
  },
  summaryContainer: {
    backgroundColor: '#F8F8F8',
    borderRadius: 8,
    padding: 16,
    marginTop: 20,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 12,
  },
  summaryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#666666',
  },
  summaryValue: {
    fontSize: 14,
    color: '#333333',
    fontWeight: '500',
  },
  bottomButtons: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  button: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonFullWidth: {
    marginLeft: 0,
  },
  previousButton: {
    backgroundColor: '#F0F0F0',
    marginRight: 8,
  },
  previousButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666666',
  },
  nextButton: {
    backgroundColor: '#FF6B6B',
    marginLeft: 8,
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  // 모달 스타일
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
  optionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  optionText: {
    fontSize: 16,
    color: '#333333',
  },
});