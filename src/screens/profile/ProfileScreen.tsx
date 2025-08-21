import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Alert,
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
  const [profile] = useState<UserProfile>(DUMMY_PROFILE);

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
    Alert.alert('포인트', '포인트 관리 화면으로 이동합니다.');
  };

  const handleTransactionHistoryPress = () => {
    Alert.alert('거래내역', '거래내역 화면으로 이동합니다.');
  };

  const handleSettingsPress = () => {
    Alert.alert('설정', '설정 화면으로 이동합니다.');
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
});