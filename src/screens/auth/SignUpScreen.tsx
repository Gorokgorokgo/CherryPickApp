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
import RNPickerSelect from 'react-native-picker-select';
import { AuthStackParamList, RootStackParamList } from '../../navigation/AppNavigator';
import { authService } from '../../services/authService';

type SignUpScreenNavigationProp = StackNavigationProp<AuthStackParamList, 'SignUp'> &
  StackNavigationProp<RootStackParamList>;

export default function SignUpScreen() {
  const navigation = useNavigation<SignUpScreenNavigationProp>();
  const [formData, setFormData] = useState({
    phoneNumber: '',
    verificationCode: '',
    nickname: '',
    email: '',
    password: '',
    passwordConfirm: '',
    region: '',
  });
  const [isCodeSent, setIsCodeSent] = useState(false);
  const [isCodeVerified, setIsCodeVerified] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);

  const formatPhoneNumber = (value: string) => {
    const numbers = value.replace(/[^\d]/g, '');
    if (numbers.length <= 3) return numbers;
    if (numbers.length <= 7) return `${numbers.slice(0, 3)}-${numbers.slice(3)}`;
    return `${numbers.slice(0, 3)}-${numbers.slice(3, 7)}-${numbers.slice(7, 11)}`;
  };

  const regions = [
    { label: '서울특별시', value: '서울특별시' },
    { label: '부산광역시', value: '부산광역시' },
    { label: '대구광역시', value: '대구광역시' },
    { label: '인천광역시', value: '인천광역시' },
    { label: '광주광역시', value: '광주광역시' },
    { label: '대전광역시', value: '대전광역시' },
    { label: '울산광역시', value: '울산광역시' },
    { label: '세종특별자치시', value: '세종특별자치시' },
    { label: '경기도', value: '경기도' },
    { label: '강원도', value: '강원도' },
    { label: '충청북도', value: '충청북도' },
    { label: '충청남도', value: '충청남도' },
    { label: '전라북도', value: '전라북도' },
    { label: '전라남도', value: '전라남도' },
    { label: '경상북도', value: '경상북도' },
    { label: '경상남도', value: '경상남도' },
    { label: '제주특별자치도', value: '제주특별자치도' },
  ];

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    if (field === 'phoneNumber') {
      const formatted = formatPhoneNumber(value);
      setFormData(prev => ({ ...prev, [field]: formatted }));
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
  };

  const handleSendCode = async (isResend = false) => {
    if (!formData.phoneNumber.trim()) {
      Alert.alert('오류', '휴대폰 번호를 입력해주세요.');
      return;
    }

    if (isResend) {
      setResendLoading(true);
    } else {
      setLoading(true);
    }

    try {
      const cleanPhoneNumber = formData.phoneNumber.replace(/[^\d]/g, '');
      const response = await authService.sendCode({ phoneNumber: cleanPhoneNumber });
      
      // 인증번호 추출
      const codeMatch = response.message?.match(/개발용: (\d{6})/);
      const code = codeMatch ? codeMatch[1] : 'Unknown';
      console.log('🔑 인증번호:', code);
      
      setIsCodeSent(true);
      setIsCodeVerified(false);
      Alert.alert('알림', `인증번호가 ${isResend ? '재' : ''}발송되었습니다.\n개발용 코드: ${code}`);
    } catch (error) {
      console.error('Send code error:', error);
      Alert.alert('오류', '인증번호 발송에 실패했습니다.');
    } finally {
      if (isResend) {
        setResendLoading(false);
      } else {
        setLoading(false);
      }
    }
  };

  const handleVerifyCode = async () => {
    if (!formData.verificationCode.trim()) {
      Alert.alert('오류', '인증번호를 입력해주세요.');
      return;
    }

    setLoading(true);
    try {
      const cleanPhoneNumber = formData.phoneNumber.replace(/[^\d]/g, '');
      await authService.verifyCode({
        phoneNumber: cleanPhoneNumber,
        verificationCode: formData.verificationCode,
      });
      
      setIsCodeVerified(true);
      Alert.alert('성공', '인증번호가 확인되었습니다.');
    } catch (error: any) {
      console.log('❌ 인증번호 검증 실패:', error?.response?.data);
      Alert.alert('오류', '인증번호가 올바르지 않습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async () => {
    const { phoneNumber, verificationCode, nickname, email, password, passwordConfirm } = formData;
    
    if (!phoneNumber.trim() || !verificationCode.trim() || !nickname.trim() || !email.trim() || !password.trim() || !passwordConfirm.trim()) {
      Alert.alert('오류', '필수 필드를 모두 입력해주세요.');
      return;
    }

    if (password !== passwordConfirm) {
      Alert.alert('오류', '비밀번호가 일치하지 않습니다.');
      return;
    }

    if (!isCodeVerified) {
      Alert.alert('오류', '인증번호를 먼저 확인해주세요.');
      return;
    }

    setLoading(true);
    try {
      const cleanPhoneNumber = phoneNumber.replace(/[^\d]/g, '');
      
      console.log('🚀 회원가입 진행 중...');
      await authService.signup({
        phoneNumber: cleanPhoneNumber,
        code: verificationCode,
        nickname,
        email,
        password,
      });
      Alert.alert('알림', '회원가입이 완료되었습니다.', [
        { text: '확인', onPress: () => navigation.navigate('Main') }
      ]);
    } catch (error: any) {
      console.log('❌ 회원가입 실패');
      console.log('Status Code:', error?.response?.status);
      console.log('Error Code:', error?.response?.data?.code);
      console.log('Error Message:', error?.response?.data?.message);
      console.log('Field Errors:', error?.response?.data?.fieldErrors);
      
      const errorData = error?.response?.data;
      let errorMessage = errorData?.message || '회원가입에 실패했습니다.';
      
      if (errorData?.fieldErrors && Array.isArray(errorData.fieldErrors)) {
        const fieldErrors = errorData.fieldErrors.map((err: any) => `${err.field}: ${err.message}`).join('\n');
        errorMessage = `입력값 오류:\n${fieldErrors}`;
      }
      
      Alert.alert('오류', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleGoToLogin = () => {
    navigation.navigate('Login');
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
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
                />
                <TouchableOpacity
                  style={[
                    styles.sendCodeButton,
                    (loading || resendLoading) && styles.sendCodeButtonDisabled,
                  ]}
                  onPress={() => handleSendCode(isCodeSent)}
                  disabled={loading || resendLoading}
                >
                  <Text style={styles.sendCodeButtonText}>
                    {loading || resendLoading ? '발송중...' : isCodeSent ? '재발송' : '인증번호'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {isCodeSent && (
              <View style={styles.inputContainer}>
                <Text style={styles.label}>인증번호 *</Text>
                <View style={styles.phoneInputRow}>
                  <TextInput
                    style={[styles.input, styles.phoneInput]}
                    placeholder="인증번호 6자리 입력"
                    value={formData.verificationCode}
                    onChangeText={(value) => handleInputChange('verificationCode', value)}
                    keyboardType="number-pad"
                    maxLength={6}
                  />
                  <TouchableOpacity
                    style={[
                      styles.sendCodeButton,
                      (loading || isCodeVerified) && styles.sendCodeButtonDisabled,
                    ]}
                    onPress={handleVerifyCode}
                    disabled={loading || isCodeVerified || !formData.verificationCode.trim()}
                  >
                    <Text style={styles.sendCodeButtonText}>
                      {loading ? '확인중...' : isCodeVerified ? '확인됨' : '확인'}
                    </Text>
                  </TouchableOpacity>
                </View>
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
                keyboardType="default"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>이메일 *</Text>
              <TextInput
                style={styles.input}
                placeholder="example@email.com"
                value={formData.email}
                onChangeText={(value) => handleInputChange('email', value)}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>비밀번호 *</Text>
              <TextInput
                style={styles.input}
                placeholder="6자 이상, 특수문자 포함"
                value={formData.password}
                onChangeText={(value) => handleInputChange('password', value)}
                secureTextEntry={true}
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>비밀번호 확인 *</Text>
              <TextInput
                style={styles.input}
                placeholder="비밀번호를 다시 입력하세요"
                value={formData.passwordConfirm}
                onChangeText={(value) => handleInputChange('passwordConfirm', value)}
                secureTextEntry={true}
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>지역</Text>
              <TextInput
                style={styles.input}
                placeholder="예: 서울특별시"
                value={formData.region}
                onChangeText={(value) => handleInputChange('region', value)}
                keyboardType="default"
              />
            </View>

            <TouchableOpacity
              style={[
                styles.signUpButton,
                (!isCodeVerified || !formData.nickname.trim() || !formData.email.trim() || 
                 !formData.password.trim() || !formData.passwordConfirm.trim()) && styles.signUpButtonDisabled,
              ]}
              onPress={handleSignUp}
              disabled={
                loading || !isCodeVerified || !formData.nickname.trim() || 
                !formData.email.trim() || !formData.password.trim() || !formData.passwordConfirm.trim()
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
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    backgroundColor: '#FAFAFA',
  },
  pickerInput: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 16,
    color: '#333333',
  },
});