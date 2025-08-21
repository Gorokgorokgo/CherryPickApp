import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Alert,
  Switch,
  Modal,
  TextInput,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

interface UserProfile {
  nickname: string;
  phoneNumber: string;
  region: string;
  level: number;
  points: number;
  sellerRating: number;
  buyerRating: number;
  totalTransactions: number;
}

// 임시 더미 데이터
const DUMMY_PROFILE: UserProfile = {
  nickname: '체리픽러123',
  phoneNumber: '010-1234-5678',
  region: '서울시 강남구',
  level: 3,
  points: 125000,
  sellerRating: 4.8,
  buyerRating: 4.6,
  totalTransactions: 24,
};

export default function ProfileScreen() {
  const [profile, setProfile] = useState<UserProfile>(DUMMY_PROFILE);
  const [showPointsModal, setShowPointsModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(false);
  const [chargeAmount, setChargeAmount] = useState('');

  const formatPrice = (price: number) => {
    return price.toLocaleString() + '원';
  };

  const renderStarRating = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 1; i <= 5; i++) {
      if (i <= fullStars) {
        stars.push(<Icon key={i} name="star" size={16} color="#FFD700" />);
      } else if (i === fullStars + 1 && hasHalfStar) {
        stars.push(<Icon key={i} name="star-half" size={16} color="#FFD700" />);
      } else {
        stars.push(<Icon key={i} name="star-border" size={16} color="#E0E0E0" />);
      }
    }
    return <View style={styles.starContainer}>{stars}</View>;
  };

  const handlePointsPress = () => {
    setShowPointsModal(true);
  };

  const handleChargePoints = () => {
    const amount = parseInt(chargeAmount.replace(/,/g, ''));
    if (!amount || amount < 10000) {
      Alert.alert('오류', '최소 10,000원 이상 충전해주세요.');
      return;
    }
    
    Alert.alert(
      '포인트 충전',
      `${amount.toLocaleString()}원을 충전하시겠습니까?`,
      [
        { text: '취소', style: 'cancel' },
        { 
          text: '충전',
          onPress: () => {
            setProfile(prev => ({ ...prev, points: prev.points + amount }));
            setChargeAmount('');
            setShowPointsModal(false);
            Alert.alert('성공', '포인트가 충전되었습니다.');
          }
        }
      ]
    );
  };

  const handleTransactionHistoryPress = () => {
    Alert.alert('거래내역', '거래내역 화면으로 이동합니다.');
  };

  const handleSettingsPress = () => {
    setShowSettingsModal(true);
  };

  const handleLogoutPress = () => {
    Alert.alert(
      '로그아웃',
      '정말 로그아웃하시겠습니까?',
      [
        { text: '취소', style: 'cancel' },
        { text: '로그아웃', onPress: () => Alert.alert('알림', '로그아웃되었습니다.') },
      ]
    );
  };

  const menuItems = [
    {
      icon: 'login',
      title: '로그인 테스트',
      subtitle: '개발용 로그인 화면',
      onPress: () => {
        // 개발용: 로그인 화면으로 이동
        Alert.alert('개발용', '로그인 화면으로 이동하려면 스플래시 화면에서 Auth로 변경하세요.');
      },
    },
    {
      icon: 'person-add',
      title: '회원가입 테스트',
      subtitle: '개발용 회원가입 화면',
      onPress: () => {
        Alert.alert('개발용', '회원가입 화면으로 이동하려면 스플래시 화면에서 Auth로 변경하세요.');
      },
    },
    {
      icon: 'account-balance-wallet',
      title: '포인트 관리',
      subtitle: formatPrice(profile.points),
      onPress: handlePointsPress,
    },
    {
      icon: 'history',
      title: '거래 내역',
      subtitle: `총 ${profile.totalTransactions}건`,
      onPress: handleTransactionHistoryPress,
    },
    {
      icon: 'help-outline',
      title: '고객센터',
      onPress: () => Alert.alert('고객센터', '고객센터 화면으로 이동합니다.'),
    },
    {
      icon: 'info-outline',
      title: '앱 정보',
      onPress: () => Alert.alert('앱 정보', '체리픽 v1.0.0'),
    },
    {
      icon: 'settings',
      title: '설정',
      onPress: handleSettingsPress,
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* 헤더 */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>프로필</Text>
        </View>

        {/* 프로필 정보 */}
        <View style={styles.profileSection}>
          <View style={styles.avatarContainer}>
            <Icon name="account-circle" size={80} color="#E0E0E0" />
          </View>
          
          <View style={styles.profileInfo}>
            <Text style={styles.nickname}>{profile.nickname}</Text>
            <Text style={styles.region}>{profile.region}</Text>
            <View style={styles.levelContainer}>
              <Text style={styles.levelText}>레벨 {profile.level}</Text>
            </View>
          </View>
        </View>

        {/* 평점 정보 */}
        <View style={styles.ratingSection}>
          <View style={styles.ratingItem}>
            <Text style={styles.ratingLabel}>판매자 평점</Text>
            <View style={styles.ratingRow}>
              {renderStarRating(profile.sellerRating)}
              <Text style={styles.ratingValue}>{profile.sellerRating}</Text>
            </View>
          </View>
          
          <View style={styles.ratingDivider} />
          
          <View style={styles.ratingItem}>
            <Text style={styles.ratingLabel}>구매자 평점</Text>
            <View style={styles.ratingRow}>
              {renderStarRating(profile.buyerRating)}
              <Text style={styles.ratingValue}>{profile.buyerRating}</Text>
            </View>
          </View>
        </View>

        {/* 메뉴 목록 */}
        <View style={styles.menuSection}>
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={styles.menuItem}
              onPress={item.onPress}
            >
              <View style={styles.menuLeft}>
                <Icon name={item.icon} size={24} color="#666666" />
                <View style={styles.menuTextContainer}>
                  <Text style={styles.menuTitle}>{item.title}</Text>
                  {item.subtitle && (
                    <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
                  )}
                </View>
              </View>
              <Icon name="chevron-right" size={24} color="#CCCCCC" />
            </TouchableOpacity>
          ))}
        </View>

        {/* 로그아웃 버튼 */}
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogoutPress}
        >
          <Text style={styles.logoutButtonText}>로그아웃</Text>
        </TouchableOpacity>

        <View style={styles.bottomSpace} />
      </ScrollView>

      {/* 포인트 관리 모달 */}
      <Modal
        visible={showPointsModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowPointsModal(false)}>
              <Icon name="close" size={24} color="#333333" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>포인트 관리</Text>
            <View style={{ width: 24 }} />
          </View>

          <ScrollView style={styles.modalContent}>
            <View style={styles.pointsInfo}>
              <Text style={styles.pointsLabel}>보유 포인트</Text>
              <Text style={styles.pointsAmount}>{formatPrice(profile.points)}</Text>
            </View>

            <View style={styles.chargeSection}>
              <Text style={styles.sectionTitle}>포인트 충전</Text>
              
              <View style={styles.chargeAmountContainer}>
                <TextInput
                  style={styles.chargeInput}
                  placeholder="충전할 금액을 입력하세요"
                  value={chargeAmount}
                  onChangeText={(value) => {
                    const numericValue = value.replace(/[^0-9]/g, '');
                    if (numericValue) {
                      setChargeAmount(parseInt(numericValue).toLocaleString());
                    } else {
                      setChargeAmount('');
                    }
                  }}
                  keyboardType="numeric"
                />
                <Text style={styles.chargeSuffix}>원</Text>
              </View>

              <View style={styles.quickChargeContainer}>
                {[10000, 50000, 100000, 500000].map(amount => (
                  <TouchableOpacity
                    key={amount}
                    style={styles.quickChargeButton}
                    onPress={() => setChargeAmount(amount.toLocaleString())}
                  >
                    <Text style={styles.quickChargeText}>+{amount.toLocaleString()}원</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <TouchableOpacity
                style={[
                  styles.chargeButton,
                  !chargeAmount && styles.chargeButtonDisabled
                ]}
                onPress={handleChargePoints}
                disabled={!chargeAmount}
              >
                <Text style={styles.chargeButtonText}>충전하기</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.pointsHistory}>
              <Text style={styles.sectionTitle}>최근 사용 내역</Text>
              <Text style={styles.historyPlaceholder}>사용 내역이 없습니다.</Text>
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* 설정 모달 */}
      <Modal
        visible={showSettingsModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowSettingsModal(false)}>
              <Icon name="close" size={24} color="#333333" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>설정</Text>
            <View style={{ width: 24 }} />
          </View>

          <ScrollView style={styles.modalContent}>
            <View style={styles.settingSection}>
              <Text style={styles.sectionTitle}>알림 설정</Text>
              
              <View style={styles.settingItem}>
                <View style={styles.settingLeft}>
                  <Icon name="notifications" size={24} color="#666666" />
                  <View style={styles.settingTextContainer}>
                    <Text style={styles.settingTitle}>푸시 알림</Text>
                    <Text style={styles.settingSubtitle}>입찰, 낙찰 등 중요 알림</Text>
                  </View>
                </View>
                <Switch
                  value={pushNotifications}
                  onValueChange={setPushNotifications}
                  trackColor={{ false: '#E0E0E0', true: '#FF6B6B' }}
                />
              </View>

              <View style={styles.settingItem}>
                <View style={styles.settingLeft}>
                  <Icon name="email" size={24} color="#666666" />
                  <View style={styles.settingTextContainer}>
                    <Text style={styles.settingTitle}>이메일 알림</Text>
                    <Text style={styles.settingSubtitle}>마케팅 및 이벤트 알림</Text>
                  </View>
                </View>
                <Switch
                  value={emailNotifications}
                  onValueChange={setEmailNotifications}
                  trackColor={{ false: '#E0E0E0', true: '#FF6B6B' }}
                />
              </View>
            </View>

            <View style={styles.settingSection}>
              <Text style={styles.sectionTitle}>계정 관리</Text>
              
              <TouchableOpacity style={styles.settingMenuItem}>
                <Icon name="edit" size={24} color="#666666" />
                <Text style={styles.settingMenuText}>프로필 수정</Text>
                <Icon name="chevron-right" size={24} color="#CCCCCC" />
              </TouchableOpacity>

              <TouchableOpacity style={styles.settingMenuItem}>
                <Icon name="lock" size={24} color="#666666" />
                <Text style={styles.settingMenuText}>비밀번호 변경</Text>
                <Icon name="chevron-right" size={24} color="#CCCCCC" />
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.settingMenuItem}
                onPress={() => {
                  Alert.alert(
                    '회원탈퇴',
                    '정말로 회원탈퇴를 진행하시겠습니까?\n\n탈퇴 시 모든 데이터가 삭제되며 복구할 수 없습니다.',
                    [
                      { text: '취소', style: 'cancel' },
                      { text: '회원탈퇴', style: 'destructive' }
                    ]
                  );
                }}
              >
                <Icon name="person-remove" size={24} color="#FF6B6B" />
                <Text style={[styles.settingMenuText, { color: '#FF6B6B' }]}>회원탈퇴</Text>
                <Icon name="chevron-right" size={24} color="#CCCCCC" />
              </TouchableOpacity>
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F8F8',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333333',
  },
  profileSection: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarContainer: {
    marginBottom: 16,
  },
  profileInfo: {
    alignItems: 'center',
  },
  nickname: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 4,
  },
  region: {
    fontSize: 16,
    color: '#666666',
    marginBottom: 12,
  },
  levelContainer: {
    backgroundColor: '#FF6B6B',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  levelText: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  ratingSection: {
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    paddingVertical: 20,
    marginBottom: 12,
  },
  ratingItem: {
    flex: 1,
    alignItems: 'center',
  },
  ratingLabel: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 8,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  starContainer: {
    flexDirection: 'row',
    marginRight: 8,
  },
  ratingValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
  },
  ratingDivider: {
    width: 1,
    backgroundColor: '#F0F0F0',
  },
  menuSection: {
    backgroundColor: '#FFFFFF',
    marginBottom: 12,
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F8F8F8',
  },
  menuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuTextContainer: {
    marginLeft: 16,
    flex: 1,
  },
  menuTitle: {
    fontSize: 16,
    color: '#333333',
    marginBottom: 2,
  },
  menuSubtitle: {
    fontSize: 14,
    color: '#999999',
  },
  logoutButton: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginVertical: 12,
    paddingVertical: 16,
    alignItems: 'center',
    borderRadius: 8,
  },
  logoutButtonText: {
    fontSize: 16,
    color: '#FF6B6B',
    fontWeight: '600',
  },
  bottomSpace: {
    height: 40,
  },
  // 모달 스타일
  modalContainer: {
    flex: 1,
    backgroundColor: '#F8F8F8',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
  },
  modalContent: {
    flex: 1,
    paddingTop: 20,
  },
  // 포인트 모달 스타일
  pointsInfo: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    alignItems: 'center',
    marginBottom: 20,
  },
  pointsLabel: {
    fontSize: 16,
    color: '#666666',
    marginBottom: 8,
  },
  pointsAmount: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FF6B6B',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 16,
  },
  chargeSection: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    marginBottom: 20,
  },
  chargeAmountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  chargeInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    textAlign: 'right',
  },
  chargeSuffix: {
    fontSize: 16,
    color: '#666666',
    marginLeft: 8,
  },
  quickChargeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  quickChargeButton: {
    flex: 1,
    backgroundColor: '#F8F8F8',
    paddingVertical: 10,
    marginHorizontal: 4,
    borderRadius: 6,
    alignItems: 'center',
  },
  quickChargeText: {
    fontSize: 14,
    color: '#666666',
    fontWeight: '500',
  },
  chargeButton: {
    backgroundColor: '#FF6B6B',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  chargeButtonDisabled: {
    backgroundColor: '#CCCCCC',
  },
  chargeButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  pointsHistory: {
    backgroundColor: '#FFFFFF',
    padding: 20,
  },
  historyPlaceholder: {
    fontSize: 14,
    color: '#999999',
    textAlign: 'center',
    paddingVertical: 20,
  },
  // 설정 모달 스타일
  settingSection: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    marginBottom: 20,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F8F8F8',
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingTextContainer: {
    marginLeft: 16,
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    color: '#333333',
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 14,
    color: '#999999',
  },
  settingMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F8F8F8',
  },
  settingMenuText: {
    fontSize: 16,
    color: '#333333',
    marginLeft: 16,
    flex: 1,
  },
});