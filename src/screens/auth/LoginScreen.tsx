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
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { AuthStackParamList, RootStackParamList } from '../../navigation/AppNavigator';

type LoginScreenNavigationProp = StackNavigationProp<AuthStackParamList, 'Login'> &
  StackNavigationProp<RootStackParamList>;

export default function LoginScreen() {
  const navigation = useNavigation<LoginScreenNavigationProp>();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [isCodeSent, setIsCodeSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSendCode = () => {
    if (!phoneNumber.trim()) {
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

  const handleVerifyCode = () => {
    if (!verificationCode.trim()) {
      Alert.alert('오류', '인증번호를 입력해주세요.');
      return;
    }

    setLoading(true);
    // TODO: 실제 인증번호 확인 API 연동
    setTimeout(() => {
      setLoading(false);
      // 임시로 메인 화면으로 이동
      navigation.navigate('Main');
    }, 1000);
  };

  const handleGoToSignUp = () => {
    navigation.navigate('SignUp');
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title}>로그인</Text>
            <Text style={styles.subtitle}>휴대폰 번호로 간편하게 로그인하세요</Text>
          </View>

          <View style={styles.form}>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>휴대폰 번호</Text>
              <View style={styles.phoneInputRow}>
                <TextInput
                  style={[styles.input, styles.phoneInput]}
                  placeholder="010-1234-5678"
                  value={phoneNumber}
                  onChangeText={setPhoneNumber}
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
                <Text style={styles.label}>인증번호</Text>
                <TextInput
                  style={styles.input}
                  placeholder="인증번호 6자리 입력"
                  value={verificationCode}
                  onChangeText={setVerificationCode}
                  keyboardType="number-pad"
                  maxLength={6}
                />
              </View>
            )}

            <TouchableOpacity
              style={[
                styles.loginButton,
                (!isCodeSent || !verificationCode.trim()) && styles.loginButtonDisabled,
              ]}
              onPress={handleVerifyCode}
              disabled={loading || !isCodeSent || !verificationCode.trim()}
            >
              <Text style={styles.loginButtonText}>
                {loading ? '확인 중...' : '로그인'}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>처음 오셨나요?</Text>
            <TouchableOpacity onPress={handleGoToSignUp}>
              <Text style={styles.signUpLink}>회원가입</Text>
            </TouchableOpacity>
          </View>
        </View>
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
  content: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
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
    marginBottom: 40,
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
  loginButton: {
    backgroundColor: '#FF6B6B',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  loginButtonDisabled: {
    backgroundColor: '#CCCCCC',
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: '#666666',
    marginRight: 8,
  },
  signUpLink: {
    fontSize: 14,
    color: '#FF6B6B',
    fontWeight: '600',
  },
});