import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Icon } from '../../components/common';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';

interface NotificationSetting {
  id: string;
  title: string;
  description: string;
  category: string;
  enabled: boolean;
  priority: 'high' | 'medium' | 'low';
}

interface NotificationSettingsScreenProps {
  navigation: any;
}

const NotificationSettingsScreen: React.FC<NotificationSettingsScreenProps> = ({ navigation }) => {
  const [globalEnabled, setGlobalEnabled] = useState(true);
  const [settings, setSettings] = useState<NotificationSetting[]>([
    {
      id: 'bid_new',
      title: '새로운 입찰',
      description: '내가 등록한 경매에 새로운 입찰이 있을 때',
      category: 'auction',
      enabled: true,
      priority: 'high',
    },
    {
      id: 'bid_outbid',
      title: '입찰가 밀림',
      description: '내 입찰가보다 높은 입찰이 있을 때',
      category: 'auction',
      enabled: true,
      priority: 'high',
    },
    {
      id: 'auction_ending',
      title: '경매 마감 임박',
      description: '참여 중인 경매가 1시간 이내 마감될 때',
      category: 'auction',
      enabled: true,
      priority: 'medium',
    },
    {
      id: 'auction_won',
      title: '낙찰 알림',
      description: '경매에서 낙찰받았을 때',
      category: 'auction',
      enabled: true,
      priority: 'high',
    },
    {
      id: 'auction_sold',
      title: '판매 완료',
      description: '내가 등록한 경매가 낙찰되었을 때',
      category: 'auction',
      enabled: true,
      priority: 'high',
    },
    {
      id: 'chat_message',
      title: '새로운 메시지',
      description: '채팅방에 새로운 메시지가 도착했을 때',
      category: 'chat',
      enabled: true,
      priority: 'medium',
    },
    {
      id: 'transaction_start',
      title: '거래 시작',
      description: '연결 서비스 결제 완료 후 채팅이 시작될 때',
      category: 'transaction',
      enabled: true,
      priority: 'high',
    },
    {
      id: 'transaction_complete',
      title: '거래 완료',
      description: '상대방이 거래 완료 처리했을 때',
      category: 'transaction',
      enabled: true,
      priority: 'high',
    },
    {
      id: 'payment_success',
      title: '결제 완료',
      description: '포인트 충전이나 연결 서비스 결제가 완료됐을 때',
      category: 'payment',
      enabled: true,
      priority: 'medium',
    },
    {
      id: 'payment_failed',
      title: '결제 실패',
      description: '결제 처리 중 오류가 발생했을 때',
      category: 'payment',
      enabled: true,
      priority: 'high',
    },
    {
      id: 'level_up',
      title: '레벨 업',
      description: '사용자 레벨이 상승했을 때',
      category: 'system',
      enabled: true,
      priority: 'low',
    },
    {
      id: 'maintenance',
      title: '서비스 공지',
      description: '서비스 점검이나 중요 공지사항',
      category: 'system',
      enabled: true,
      priority: 'medium',
    },
    {
      id: 'marketing_event',
      title: '이벤트 소식',
      description: '특별 이벤트나 프로모션 정보',
      category: 'marketing',
      enabled: false,
      priority: 'low',
    },
    {
      id: 'marketing_newsletter',
      title: '뉴스레터',
      description: '주간 경매 동향이나 인기 상품 정보',
      category: 'marketing',
      enabled: false,
      priority: 'low',
    },
  ]);

  const [loading, setLoading] = useState(false);

  const categories = [
    { key: 'auction', label: '경매 알림', icon: 'gavel' },
    { key: 'chat', label: '채팅 알림', icon: 'chat' },
    { key: 'transaction', label: '거래 알림', icon: 'handshake' },
    { key: 'payment', label: '결제 알림', icon: 'payment' },
    { key: 'system', label: '시스템 알림', icon: 'settings' },
    { key: 'marketing', label: '마케팅 알림', icon: 'campaign' },
  ];

  const toggleGlobalNotification = (enabled: boolean) => {
    setGlobalEnabled(enabled);
    if (!enabled) {
      // 전체 알림 비활성화시 모든 개별 알림도 비활성화
      setSettings(prev => prev.map(setting => ({ ...setting, enabled: false })));
    }
  };

  const toggleNotification = (id: string, enabled: boolean) => {
    setSettings(prev =>
      prev.map(setting =>
        setting.id === id ? { ...setting, enabled } : setting
      )
    );
  };

  const saveSettings = async () => {
    setLoading(true);
    try {
      // TODO: API 호출
      await new Promise<void>(resolve => setTimeout(() => resolve(), 1000));
      Alert.alert('저장 완료', '알림 설정이 저장되었습니다.');
    } catch (error) {
      Alert.alert('오류', '설정 저장에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const resetToDefault = () => {
    Alert.alert(
      '기본 설정으로 복원',
      '알림 설정을 기본값으로 되돌리시겠습니까?',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '복원',
          onPress: () => {
            setGlobalEnabled(true);
            setSettings(prev =>
              prev.map(setting => ({
                ...setting,
                enabled: setting.category !== 'marketing',
              }))
            );
          },
        },
      ]
    );
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return '#F44336';
      case 'medium': return '#FF9800';
      case 'low': return '#4CAF50';
      default: return '#999';
    }
  };

  const getPriorityText = (priority: string) => {
    switch (priority) {
      case 'high': return '높음';
      case 'medium': return '보통';
      case 'low': return '낮음';
      default: return '';
    }
  };

  const renderCategorySection = (categoryKey: string) => {
    const category = categories.find(c => c.key === categoryKey);
    const categorySettings = settings.filter(s => s.category === categoryKey);
    
    if (!category || categorySettings.length === 0) return null;

    return (
      <Card key={categoryKey} style={styles.categorySection}>
        <View style={styles.categoryHeader}>
          <Icon name={category.icon} size={24} color="#FF6B6B" />
          <Text style={styles.categoryTitle}>{category.label}</Text>
        </View>
        
        {categorySettings.map(setting => (
          <View key={setting.id} style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <View style={styles.settingTitleRow}>
                <Text style={styles.settingTitle}>{setting.title}</Text>
                <View style={[
                  styles.priorityBadge,
                  { backgroundColor: getPriorityColor(setting.priority) }
                ]}>
                  <Text style={styles.priorityText}>
                    {getPriorityText(setting.priority)}
                  </Text>
                </View>
              </View>
              <Text style={styles.settingDescription}>{setting.description}</Text>
            </View>
            <Switch
              value={setting.enabled && globalEnabled}
              onValueChange={(enabled) => toggleNotification(setting.id, enabled)}
              disabled={!globalEnabled}
              trackColor={{ false: '#ccc', true: '#FF6B6B' }}
              thumbColor="white"
            />
          </View>
        ))}
      </Card>
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
        <Text style={styles.headerTitle}>알림 설정</Text>
        <TouchableOpacity
          style={styles.resetButton}
          onPress={resetToDefault}
        >
          <Icon name="refresh" size={24} color="#666" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* 전체 알림 설정 */}
        <Card style={styles.globalSection}>
          <View style={styles.globalSetting}>
            <View style={styles.globalInfo}>
              <Icon name="notifications" size={24} color="#FF6B6B" />
              <View style={styles.globalText}>
                <Text style={styles.globalTitle}>푸시 알림</Text>
                <Text style={styles.globalDescription}>
                  {globalEnabled ? '모든 알림 받기' : '모든 알림 받지 않기'}
                </Text>
              </View>
            </View>
            <Switch
              value={globalEnabled}
              onValueChange={toggleGlobalNotification}
              trackColor={{ false: '#ccc', true: '#FF6B6B' }}
              thumbColor="white"
            />
          </View>
          
          {!globalEnabled && (
            <View style={styles.disabledNotice}>
              <Icon name="info-outline" size={16} color="#FF9800" />
              <Text style={styles.disabledNoticeText}>
                푸시 알림이 비활성화되어 있습니다. 개별 알림 설정을 변경하려면 푸시 알림을 먼저 활성화해주세요.
              </Text>
            </View>
          )}
        </Card>

        {/* 알림 시간 설정 */}
        <Card style={styles.timeSection}>
          <View style={styles.timeSetting}>
            <View style={styles.timeInfo}>
              <Icon name="schedule" size={24} color="#FF6B6B" />
              <View style={styles.timeText}>
                <Text style={styles.timeTitle}>알림 허용 시간</Text>
                <Text style={styles.timeDescription}>오전 8시 ~ 오후 10시</Text>
              </View>
            </View>
            <TouchableOpacity
              style={styles.timeButton}
              onPress={() => navigation.navigate('NotificationTime')}
            >
              <Text style={styles.timeButtonText}>변경</Text>
              <Icon name="chevron-right" size={16} color="#666" />
            </TouchableOpacity>
          </View>
        </Card>

        {/* 카테고리별 알림 설정 */}
        {categories.map(category => renderCategorySection(category.key))}

        {/* 알림 테스트 */}
        <Card style={styles.testSection}>
          <View style={styles.testHeader}>
            <Icon name="science" size={24} color="#FF6B6B" />
            <Text style={styles.testTitle}>알림 테스트</Text>
          </View>
          <Text style={styles.testDescription}>
            현재 설정으로 테스트 알림을 받아보세요.
          </Text>
          <TouchableOpacity
            style={styles.testButton}
            onPress={() => {
              if (globalEnabled) {
                Alert.alert('테스트 알림', '테스트 알림이 발송되었습니다.');
              } else {
                Alert.alert('알림', '푸시 알림이 비활성화되어 있습니다.');
              }
            }}
          >
            <Icon name="send" size={16} color="#FF6B6B" />
            <Text style={styles.testButtonText}>테스트 알림 보내기</Text>
          </TouchableOpacity>
        </Card>
      </ScrollView>

      {/* 저장 버튼 */}
      <View style={styles.bottomSection}>
        <Button
          title="설정 저장"
          onPress={saveSettings}
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
  resetButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  globalSection: {
    padding: 20,
    marginBottom: 16,
    backgroundColor: 'white',
  },
  globalSetting: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  globalInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  globalText: {
    marginLeft: 12,
    flex: 1,
  },
  globalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  globalDescription: {
    fontSize: 14,
    color: '#666',
  },
  disabledNotice: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 16,
    padding: 12,
    backgroundColor: '#FFF8E1',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FFE082',
  },
  disabledNoticeText: {
    fontSize: 13,
    color: '#FF8F00',
    marginLeft: 8,
    flex: 1,
    lineHeight: 18,
  },
  timeSection: {
    padding: 20,
    marginBottom: 16,
    backgroundColor: 'white',
  },
  timeSetting: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  timeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  timeText: {
    marginLeft: 12,
    flex: 1,
  },
  timeTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 4,
  },
  timeDescription: {
    fontSize: 14,
    color: '#666',
  },
  timeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#f5f5f5',
    borderRadius: 6,
  },
  timeButtonText: {
    fontSize: 14,
    color: '#666',
    marginRight: 4,
  },
  categorySection: {
    padding: 20,
    marginBottom: 16,
    backgroundColor: 'white',
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginLeft: 8,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
  },
  settingInfo: {
    flex: 1,
    marginRight: 16,
  },
  settingTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  settingTitle: {
    fontSize: 15,
    fontWeight: '500',
    color: '#333',
    flex: 1,
  },
  priorityBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    marginLeft: 8,
  },
  priorityText: {
    fontSize: 10,
    color: 'white',
    fontWeight: '500',
  },
  settingDescription: {
    fontSize: 13,
    color: '#666',
    lineHeight: 18,
  },
  testSection: {
    padding: 20,
    marginBottom: 32,
    backgroundColor: 'white',
  },
  testHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  testTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginLeft: 8,
  },
  testDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
    lineHeight: 20,
  },
  testButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#FF6B6B',
    borderRadius: 8,
    backgroundColor: 'white',
  },
  testButtonText: {
    fontSize: 14,
    color: '#FF6B6B',
    fontWeight: '500',
    marginLeft: 6,
  },
  bottomSection: {
    padding: 16,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
});

export default NotificationSettingsScreen;