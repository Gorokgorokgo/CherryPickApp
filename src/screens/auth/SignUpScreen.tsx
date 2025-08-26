import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { AuthStackParamList, RootStackParamList } from '../../navigation/AppNavigator';

type SignUpScreenNavigationProp = StackNavigationProp<AuthStackParamList, 'SignUp'> &
  StackNavigationProp<RootStackParamList>;

export default function SignUpScreen() {
  const navigation = useNavigation<SignUpScreenNavigationProp>();
  const [formData, setFormData] = useState({
    phoneNumber: '',
    verificationCode: '',
    nickname: '',
    region: '',
  });
  const [isCodeSent, setIsCodeSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSendCode = () => {
    if (!formData.phoneNumber.trim()) {
      Alert.alert('오류', '휴대폰 번호를 입력해주세요.');
      return;
    }

    setLoading(true);
    // TODO: 실제 인증번호 발송 API 연동
    setTimeout(() => {
      setLoading(false);
      setIsCodeSent(true);
      Alert.alert('알림', '인증번호가 발송되었습니다.');
    }, 1000);
  };

  const handleSignUp = () => {
    const { phoneNumber, verificationCode, nickname, region } = formData;
    
    if (!phoneNumber.trim() || !verificationCode.trim() || !nickname.trim() || !region.trim()) {
      Alert.alert('오류', '모든 필드를 입력해주세요.');
      return;
    }

    setLoading(true);
    // TODO: 실제 회원가입 API 연동
    setTimeout(() => {
      setLoading(false);
      Alert.alert('알림', '회원가입이 완료되었습니다.', [
        {
          text: '확인',
          onPress: () => navigation.navigate('Main'),
        },
      ]);
    }, 1000);
  };

  const handleGoToLogin = () => {
    navigation.navigate('Login');
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            <Text style={styles.title}>회원가입</Text>
            <Text style={styles.subtitle}>체리픽에 오신 것을 환영합니다</Text>
          </View>

          <View style={styles.form}>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>휴대폰 번호 *</Text>
              <View style={styles.phoneInputRow}>
                <TextInput
                  style={[styles.input, styles.phoneInput]}
                  placeholder="010-1234-5678"
                  value={formData.phoneNumber}
                  onChangeText={(value) => handleInputChange('phoneNumber', value)}
                  keyboardType="phone-pad"
                  editable={!isCodeSent}
                />
                <TouchableOpacity
                  style={[
                    styles.sendCodeButton,
                    isCodeSent && styles.sendCodeButtonDisabled,
                  ]}
                  onPress={handleSendCode}
                  disabled={loading || isCodeSent}
                >
                  <Text style={styles.sendCodeButtonText}>
                    {isCodeSent ? '발송됨' : '인증번호'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {isCodeSent && (
              <View style={styles.inputContainer}>
                <Text style={styles.label}>인증번호 *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="인증번호 6자리 입력"
                  value={formData.verificationCode}
                  onChangeText={(value) => handleInputChange('verificationCode', value)}
                  keyboardType="number-pad"
                  maxLength={6}
                />
              </View>
            )}

            <View style={styles.inputContainer}>
              <Text style={styles.label}>닉네임 *</Text>
              <TextInput
                style={styles.input}
                placeholder="닉네임을 입력하세요 (2-10자)"
                value={formData.nickname}
                onChangeText={(value) => handleInputChange('nickname', value)}
                maxLength={10}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>지역 *</Text>
              <TextInput
                style={styles.input}
                placeholder="예: 서울시 강남구"
                value={formData.region}
                onChangeText={(value) => handleInputChange('region', value)}
              />
            </View>

            <TouchableOpacity
              style={[
                styles.signUpButton,
                (!isCodeSent || !formData.verificationCode.trim() || 
                 !formData.nickname.trim() || !formData.region.trim()) && styles.signUpButtonDisabled,
              ]}
              onPress={handleSignUp}
              disabled={
                loading || !isCodeSent || !formData.verificationCode.trim() ||
                !formData.nickname.trim() || !formData.region.trim()
              }
            >
              <Text style={styles.signUpButtonText}>
                {loading ? '처리 중...' : '가입 완료'}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>이미 계정이 있으신가요?</Text>
            <TouchableOpacity onPress={handleGoToLogin}>
              <Text style={styles.loginLink}>로그인</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.terms}>
            <Text style={styles.termsText}>
              회원가입 시 <Text style={styles.termsLink}>이용약관</Text> 및{' '}
              <Text style={styles.termsLink}>개인정보처리방침</Text>에 동의한 것으로 간주됩니다.
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 40,
    paddingBottom: 24,
  },
  header: {
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666666',
  },
  form: {
    marginBottom: 30,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 8,
  },
  phoneInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
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
  phoneInput: {
    flex: 1,
    marginRight: 12,
  },
  sendCodeButton: {
    backgroundColor: '#FF6B6B',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderRadius: 8,
  },
  sendCodeButtonDisabled: {
    backgroundColor: '#CCCCCC',
  },
  sendCodeButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  signUpButton: {
    backgroundColor: '#FF6B6B',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  signUpButtonDisabled: {
    backgroundColor: '#CCCCCC',
  },
  signUpButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  footerText: {
    fontSize: 14,
    color: '#666666',
    marginRight: 8,
  },
  loginLink: {
    fontSize: 14,
    color: '#FF6B6B',
    fontWeight: '600',
  },
  terms: {
    paddingHorizontal: 16,
  },
  termsText: {
    fontSize: 12,
    color: '#999999',
    textAlign: 'center',
    lineHeight: 16,
  },
  termsLink: {
    color: '#FF6B6B',
    textDecorationLine: 'underline',
  },
});