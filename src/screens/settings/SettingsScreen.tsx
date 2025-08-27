import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Icon } from '../../components/common';
import Card from '../../components/common/Card';

interface SettingsScreenProps {
  navigation: any;
}

interface SettingItem {
  id: string;
  title: string;
  subtitle?: string;
  icon: string;
  type: 'navigate' | 'switch' | 'action';
  value?: boolean;
  onPress?: () => void;
  onToggle?: (value: boolean) => void;
  rightText?: string;
  showArrow?: boolean;
}

const SettingsScreen: React.FC<SettingsScreenProps> = ({ navigation }) => {
  const [pushNotifications, setPushNotifications] = useState(true);
  const [bidNotifications, setBidNotifications] = useState(true);
  const [chatNotifications, setChatNotifications] = useState(true);
  const [marketingNotifications, setMarketingNotifications] = useState(false);

  const handleLogout = () => {
    Alert.alert(
      '로그아웃',
      '정말로 로그아웃 하시겠습니까?',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '로그아웃',
          style: 'destructive',
          onPress: async () => {
            try {
              // TODO: 로그아웃 API 호출
              await new Promise<void>(resolve => setTimeout(() => resolve(), 1000));
              navigation.replace('Auth');
            } catch (error) {
              Alert.alert('오류', '로그아웃에 실패했습니다.');
            }
          },
        },
      ]
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      '계정 삭제',
      '계정을 삭제하면 모든 데이터가 영구적으로 삭제되며 복구할 수 없습니다.\n\n정말로 계정을 삭제하시겠습니까?',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '삭제',
          style: 'destructive',
          onPress: () => {
            navigation.navigate('AccountDeletion');
          },
        },
      ]
    );
  };

  const accountSettings: SettingItem[] = [
    {
      id: 'profile',
      title: '프로필 수정',
      subtitle: '닉네임, 프로필 사진 변경',
      icon: 'person',
      type: 'navigate',
      showArrow: true,
      onPress: () => navigation.navigate('EditProfile'),
    },
    {
      id: 'password',
      title: '비밀번호 변경',
      subtitle: '로그인 비밀번호 변경',
      icon: 'lock',
      type: 'navigate',
      showArrow: true,
      onPress: () => navigation.navigate('ChangePassword'),
    },
    {
      id: 'phone',
      title: '휴대폰 번호 변경',
      subtitle: '인증된 휴대폰 번호 변경',
      icon: 'phone',
      type: 'navigate',
      showArrow: true,
      onPress: () => navigation.navigate('ChangePhone'),
    },
  ];

  const notificationSettings: SettingItem[] = [
    {
      id: 'push_all',
      title: '푸시 알림',
      subtitle: '모든 푸시 알림 받기',
      icon: 'notifications',
      type: 'switch',
      value: pushNotifications,
      onToggle: setPushNotifications,
    },
    {
      id: 'bid_notifications',
      title: '입찰 알림',
      subtitle: '새로운 입찰, 낙찰 알림',
      icon: 'gavel',
      type: 'switch',
      value: bidNotifications && pushNotifications,
      onToggle: setBidNotifications,
    },
    {
      id: 'chat_notifications',
      title: '채팅 알림',
      subtitle: '새로운 메시지 알림',
      icon: 'chat',
      type: 'switch',
      value: chatNotifications && pushNotifications,
      onToggle: setChatNotifications,
    },
    {
      id: 'marketing_notifications',
      title: '마케팅 알림',
      subtitle: '이벤트, 혜택 정보',
      icon: 'campaign',
      type: 'switch',
      value: marketingNotifications && pushNotifications,
      onToggle: setMarketingNotifications,
    },
  ];

  const serviceSettings: SettingItem[] = [
    {
      id: 'payment_methods',
      title: '결제 수단 관리',
      subtitle: '카드, 계좌 등록 및 관리',
      icon: 'payment',
      type: 'navigate',
      showArrow: true,
      onPress: () => navigation.navigate('PaymentMethods'),
    },
    {
      id: 'address',
      title: '주소 관리',
      subtitle: '거래 장소, 배송지 관리',
      icon: 'location-on',
      type: 'navigate',
      showArrow: true,
      onPress: () => navigation.navigate('AddressManagement'),
    },
    {
      id: 'blocked_users',
      title: '차단 사용자 관리',
      subtitle: '차단한 사용자 목록',
      icon: 'block',
      type: 'navigate',
      showArrow: true,
      onPress: () => navigation.navigate('BlockedUsers'),
    },
  ];

  const supportSettings: SettingItem[] = [
    {
      id: 'faq',
      title: '자주 묻는 질문',
      icon: 'help',
      type: 'navigate',
      showArrow: true,
      onPress: () => navigation.navigate('FAQ'),
    },
    {
      id: 'contact',
      title: '문의하기',
      icon: 'support-agent',
      type: 'navigate',
      showArrow: true,
      onPress: () => navigation.navigate('Contact'),
    },
    {
      id: 'terms',
      title: '이용약관',
      icon: 'description',
      type: 'navigate',
      showArrow: true,
      onPress: () => navigation.navigate('Terms'),
    },
    {
      id: 'privacy',
      title: '개인정보처리방침',
      icon: 'privacy-tip',
      type: 'navigate',
      showArrow: true,
      onPress: () => navigation.navigate('Privacy'),
    },
  ];

  const appSettings: SettingItem[] = [
    {
      id: 'version',
      title: '앱 버전',
      icon: 'info',
      type: 'action',
      rightText: '1.0.0',
      onPress: () => {
        Alert.alert('앱 정보', '체리픽 v1.0.0\n최신 버전입니다.');
      },
    },
    {
      id: 'logout',
      title: '로그아웃',
      icon: 'logout',
      type: 'action',
      onPress: handleLogout,
    },
    {
      id: 'delete_account',
      title: '계정 삭제',
      icon: 'delete-forever',
      type: 'action',
      onPress: handleDeleteAccount,
    },
  ];

  const renderSettingItem = (item: SettingItem) => {
    return (
      <TouchableOpacity
        key={item.id}
        style={styles.settingItem}
        onPress={item.onPress}
        disabled={item.type === 'switch'}
      >
        <View style={styles.settingContent}>
          <Icon name={item.icon} size={24} color="#666" style={styles.settingIcon} />
          <View style={styles.settingText}>
            <Text style={[
              styles.settingTitle,
              item.id === 'delete_account' && styles.dangerText,
            ]}>
              {item.title}
            </Text>
            {item.subtitle && (
              <Text style={styles.settingSubtitle}>{item.subtitle}</Text>
            )}
          </View>
          
          <View style={styles.settingRight}>
            {item.type === 'switch' && (
              <Switch
                value={item.value && pushNotifications}
                onValueChange={item.onToggle}
                disabled={!pushNotifications && item.id !== 'push_all'}
                trackColor={{ false: '#ccc', true: '#FF6B6B' }}
                thumbColor={item.value ? '#white' : '#white'}
              />
            )}
            {item.rightText && (
              <Text style={styles.settingRightText}>{item.rightText}</Text>
            )}
            {item.showArrow && (
              <Icon name="chevron-right" size={20} color="#ccc" />
            )}
          </View>
        </View>
      </TouchableOpacity>
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
        <Text style={styles.headerTitle}>설정</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* 계정 설정 */}
        <Card style={styles.settingSection}>
          <Text style={styles.sectionTitle}>계정 설정</Text>
          {accountSettings.map(renderSettingItem)}
        </Card>

        {/* 알림 설정 */}
        <Card style={styles.settingSection}>
          <Text style={styles.sectionTitle}>알림 설정</Text>
          {notificationSettings.map(renderSettingItem)}
        </Card>

        {/* 서비스 설정 */}
        <Card style={styles.settingSection}>
          <Text style={styles.sectionTitle}>서비스 설정</Text>
          {serviceSettings.map(renderSettingItem)}
        </Card>

        {/* 고객 지원 */}
        <Card style={styles.settingSection}>
          <Text style={styles.sectionTitle}>고객 지원</Text>
          {supportSettings.map(renderSettingItem)}
        </Card>

        {/* 앱 정보 */}
        <Card style={styles.settingSection}>
          <Text style={styles.sectionTitle}>앱 정보</Text>
          {appSettings.map(renderSettingItem)}
        </Card>
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
  settingSection: {
    padding: 20,
    marginBottom: 16,
    backgroundColor: 'white',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  settingItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  settingContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingIcon: {
    marginRight: 16,
  },
  settingText: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 4,
  },
  dangerText: {
    color: '#F44336',
  },
  settingSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  settingRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingRightText: {
    fontSize: 14,
    color: '#666',
    marginRight: 8,
  },
});

export default SettingsScreen;