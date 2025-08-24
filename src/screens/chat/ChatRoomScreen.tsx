import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import { formatRelativeTime } from '../../utils/format';

interface Message {
  id: string;
  senderId: string;
  senderName: string;
  content: string;
  type: 'text' | 'system' | 'transaction';
  timestamp: Date;
  isRead: boolean;
}

interface ChatRoomScreenProps {
  navigation: any;
  route: {
    params: {
      chatRoomId: string;
      auctionId: string;
      title: string;
      partnerName: string;
      partnerType: 'seller' | 'buyer';
      isOnline: boolean;
    };
  };
}

const ChatRoomScreen: React.FC<ChatRoomScreenProps> = ({
  navigation,
  route,
}) => {
  const { chatRoomId, auctionId, title, partnerName, partnerType, isOnline } = route.params;
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [partnerOnline, setPartnerOnline] = useState(isOnline);
  const [transactionStatus, setTransactionStatus] = useState<'pending' | 'confirmed' | 'completed'>('pending');
  
  const flatListRef = useRef<FlatList>(null);
  const currentUserId = 'user_123'; // TODO: 실제 사용자 ID

  // 샘플 메시지 데이터
  const sampleMessages: Message[] = [
    {
      id: 'msg_1',
      senderId: 'system',
      senderName: 'System',
      content: '연결 서비스가 시작되었습니다. 안전한 거래를 위해 앱 내에서 대화해주세요.',
      type: 'system',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1일 전
      isRead: true,
    },
    {
      id: 'msg_2',
      senderId: 'partner_456',
      senderName: partnerName,
      content: '안녕하세요! 낙찰 축하드립니다 😊',
      type: 'text',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 23), // 23시간 전
      isRead: true,
    },
    {
      id: 'msg_3',
      senderId: currentUserId,
      senderName: '나',
      content: '안녕하세요! 언제 거래 가능하실까요?',
      type: 'text',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 22), // 22시간 전
      isRead: true,
    },
    {
      id: 'msg_4',
      senderId: 'partner_456',
      senderName: partnerName,
      content: '내일 오후 2시에 역삼역 2번 출구에서 만나는게 어떨까요?',
      type: 'text',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 21), // 21시간 전
      isRead: true,
    },
    {
      id: 'msg_5',
      senderId: currentUserId,
      senderName: '나',
      content: '좋습니다! 내일 2시에 역삼역에서 뵙겠습니다.',
      type: 'text',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 20), // 20시간 전
      isRead: true,
    },
    {
      id: 'msg_6',
      senderId: 'partner_456',
      senderName: partnerName,
      content: '네, 내일 오후 2시에 역삼역에서 만나요!',
      type: 'text',
      timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30분 전
      isRead: false,
    },
  ];

  useEffect(() => {
    loadMessages();
    
    // TODO: WebSocket 연결로 실시간 메시지 수신
    // const ws = new WebSocket(`ws://your-server/chat/${chatRoomId}`);
    // ws.onmessage = handleNewMessage;
    
    return () => {
      // TODO: WebSocket 연결 해제
      // ws.close();
    };
  }, []);

  const loadMessages = async () => {
    setLoading(true);
    try {
      // TODO: API 호출
      await new Promise(resolve => setTimeout(resolve, 1000));
      setMessages(sampleMessages);
    } catch (error) {
      console.error('메시지 로드 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim()) return;

    const message: Message = {
      id: `msg_${Date.now()}`,
      senderId: currentUserId,
      senderName: '나',
      content: newMessage.trim(),
      type: 'text',
      timestamp: new Date(),
      isRead: false,
    };

    setMessages(prev => [...prev, message]);
    setNewMessage('');

    try {
      // TODO: 메시지 전송 API 호출
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // 메시지 전송 후 스크롤을 맨 아래로
      setTimeout(() => {
        flatListRef.current?.scrollToEnd();
      }, 100);
    } catch (error) {
      Alert.alert('오류', '메시지 전송에 실패했습니다.');
    }
  };

  const confirmTransaction = () => {
    Alert.alert(
      '거래 완료 확인',
      '거래가 성공적으로 완료되었나요?\n거래 완료 처리 후에는 취소할 수 없습니다.',
      [
        { text: '아니요', style: 'cancel' },
        {
          text: '네, 완료됐어요',
          onPress: async () => {
            try {
              // TODO: 거래 완료 API 호출
              await new Promise(resolve => setTimeout(resolve, 1000));
              
              setTransactionStatus('completed');
              
              const systemMessage: Message = {
                id: `msg_complete_${Date.now()}`,
                senderId: 'system',
                senderName: 'System',
                content: '거래가 성공적으로 완료되었습니다. 이용해 주셔서 감사합니다!',
                type: 'system',
                timestamp: new Date(),
                isRead: true,
              };
              
              setMessages(prev => [...prev, systemMessage]);
              
              Alert.alert('거래 완료', '거래가 성공적으로 완료되었습니다!');
            } catch (error) {
              Alert.alert('오류', '거래 완료 처리에 실패했습니다.');
            }
          },
        },
      ]
    );
  };

  const renderMessage = ({ item, index }: { item: Message; index: number }) => {
    const isMyMessage = item.senderId === currentUserId;
    const isSystemMessage = item.type === 'system';
    const showTimestamp = index === 0 || 
      Math.abs(item.timestamp.getTime() - messages[index - 1].timestamp.getTime()) > 1000 * 60 * 60; // 1시간 차이

    if (isSystemMessage) {
      return (
        <View style={styles.systemMessageContainer}>
          <View style={styles.systemMessage}>
            <Icon name="info-outline" size={16} color="#666" />
            <Text style={styles.systemMessageText}>{item.content}</Text>
          </View>
          {showTimestamp && (
            <Text style={styles.messageTimestamp}>
              {formatRelativeTime(item.timestamp)}
            </Text>
          )}
        </View>
      );
    }

    return (
      <View style={[
        styles.messageContainer,
        isMyMessage ? styles.myMessageContainer : styles.partnerMessageContainer,
      ]}>
        {showTimestamp && (
          <Text style={styles.messageTimestamp}>
            {formatRelativeTime(item.timestamp)}
          </Text>
        )}
        <View style={[
          styles.messageBubble,
          isMyMessage ? styles.myMessageBubble : styles.partnerMessageBubble,
        ]}>
          <Text style={[
            styles.messageText,
            isMyMessage ? styles.myMessageText : styles.partnerMessageText,
          ]}>
            {item.content}
          </Text>
        </View>
        {isMyMessage && (
          <Icon 
            name={item.isRead ? 'done-all' : 'done'} 
            size={14} 
            color={item.isRead ? '#4CAF50' : '#999'} 
            style={styles.readIndicator}
          />
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* 헤더 */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        
        <View style={styles.headerInfo}>
          <View style={styles.partnerInfo}>
            <Text style={styles.partnerName}>
              {partnerName} ({partnerType === 'seller' ? '판매자' : '구매자'})
            </Text>
            <View style={styles.onlineStatus}>
              <View style={[
                styles.onlineIndicator,
                { backgroundColor: partnerOnline ? '#4CAF50' : '#999' }
              ]} />
              <Text style={styles.onlineText}>
                {partnerOnline ? '온라인' : '오프라인'}
              </Text>
            </View>
          </View>
          <Text style={styles.auctionTitle} numberOfLines={1}>{title}</Text>
        </View>

        <TouchableOpacity
          style={styles.menuButton}
          onPress={() => {/* TODO: 메뉴 */ }}
        >
          <Icon name="more-vert" size={24} color="#666" />
        </TouchableOpacity>
      </View>

      {/* 메시지 목록 */}
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        style={styles.messagesList}
        contentContainerStyle={styles.messagesContent}
        showsVerticalScrollIndicator={false}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
      />

      {/* 거래 완료 버튼 (거래 상대방과의 채팅인 경우만) */}
      {transactionStatus === 'pending' && (
        <View style={styles.transactionSection}>
          <Card style={styles.transactionCard}>
            <View style={styles.transactionInfo}>
              <Icon name="handshake" size={20} color="#FF6B6B" />
              <Text style={styles.transactionText}>거래가 완료되면 아래 버튼을 눌러주세요</Text>
            </View>
            <Button
              title="거래 완료 확인"
              onPress={confirmTransaction}
              variant="outline"
              size="small"
            />
          </Card>
        </View>
      )}

      {/* 입력 영역 */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <View style={styles.inputContainer}>
          <View style={styles.inputSection}>
            <TouchableOpacity
              style={styles.attachButton}
              onPress={() => {/* TODO: 파일 첨부 */ }}
            >
              <Icon name="add" size={24} color="#666" />
            </TouchableOpacity>
            
            <TextInput
              style={styles.textInput}
              value={newMessage}
              onChangeText={setNewMessage}
              placeholder="메시지를 입력하세요..."
              multiline
              maxLength={500}
              editable={transactionStatus !== 'completed'}
            />
            
            <TouchableOpacity
              style={[
                styles.sendButton,
                newMessage.trim() ? styles.sendButtonActive : styles.sendButtonInactive,
              ]}
              onPress={sendMessage}
              disabled={!newMessage.trim() || transactionStatus === 'completed'}
            >
              <Icon 
                name="send" 
                size={20} 
                color={newMessage.trim() ? 'white' : '#999'} 
              />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
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
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  headerInfo: {
    flex: 1,
  },
  partnerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  partnerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginRight: 8,
  },
  onlineStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  onlineIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 4,
  },
  onlineText: {
    fontSize: 12,
    color: '#666',
  },
  auctionTitle: {
    fontSize: 14,
    color: '#666',
  },
  menuButton: {
    padding: 8,
  },
  messagesList: {
    flex: 1,
  },
  messagesContent: {
    padding: 16,
  },
  messageContainer: {
    marginBottom: 12,
  },
  myMessageContainer: {
    alignItems: 'flex-end',
  },
  partnerMessageContainer: {
    alignItems: 'flex-start',
  },
  messageTimestamp: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
    marginBottom: 8,
  },
  messageBubble: {
    maxWidth: '70%',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 18,
  },
  myMessageBubble: {
    backgroundColor: '#FF6B6B',
    borderBottomRightRadius: 4,
  },
  partnerMessageBubble: {
    backgroundColor: 'white',
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  messageText: {
    fontSize: 16,
    lineHeight: 20,
  },
  myMessageText: {
    color: 'white',
  },
  partnerMessageText: {
    color: '#333',
  },
  readIndicator: {
    marginTop: 4,
    marginRight: 4,
  },
  systemMessageContainer: {
    alignItems: 'center',
    marginVertical: 16,
  },
  systemMessage: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    maxWidth: '80%',
  },
  systemMessageText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 6,
    textAlign: 'center',
  },
  transactionSection: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  transactionCard: {
    padding: 16,
    backgroundColor: '#f8f9ff',
    borderColor: '#e3e8ff',
  },
  transactionInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  transactionText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
    flex: 1,
  },
  inputContainer: {
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  inputSection: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  attachButton: {
    padding: 8,
    backgroundColor: '#f5f5f5',
    borderRadius: 20,
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    maxHeight: 100,
    fontSize: 16,
    backgroundColor: 'white',
  },
  sendButton: {
    padding: 12,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonActive: {
    backgroundColor: '#FF6B6B',
  },
  sendButtonInactive: {
    backgroundColor: '#f5f5f5',
  },
});

export default ChatRoomScreen;