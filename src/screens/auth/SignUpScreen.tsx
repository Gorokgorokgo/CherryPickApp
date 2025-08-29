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
import { apiService } from '../../services/api';

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
    confirmPassword: '',
  });
  const [termsAgreed, setTermsAgreed] = useState(false);
  const [privacyAgreed, setPrivacyAgreed] = useState(false);
  const [isCodeSent, setIsCodeSent] = useState(false);
  const [isCodeVerified, setIsCodeVerified] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);

  React.useEffect(() => {
    let interval: NodeJS.Timeout;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer(timer => timer - 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [resendTimer]);

  // 실시간 검증 상태
  const getPasswordStrength = () => {
    const { password } = formData;
    if (!password) return { level: 0, text: '', color: '#CCCCCC' };
    
    let score = 0;
    if (password.length >= 6) score += 1;
    if (password.length >= 8) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/[a-z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) score += 1;

    if (score <= 2) return { level: 1, text: '약함', color: '#DC3545' };
    if (score <= 4) return { level: 2, text: '보통', color: '#FFC107' };
    return { level: 3, text: '강함', color: '#28A745' };
  };

  const isPasswordMatching = () => {
    return formData.password && formData.confirmPassword && 
           formData.password === formData.confirmPassword;
  };

  const isEmailValid = () => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email);
  };

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    if (field === 'phoneNumber') {
      // 숫자만 추출
      const numbers = value.replace(/\D/g, '');
      // 010-XXXX-XXXX 형식으로 포맷팅
      let formatted = numbers;
      if (numbers.length > 3) {
        formatted = numbers.slice(0, 3) + '-' + numbers.slice(3);
      }
      if (numbers.length > 7) {
        formatted = numbers.slice(0, 3) + '-' + numbers.slice(3, 7) + '-' + numbers.slice(7, 11);
      }
      setFormData(prev => ({ ...prev, [field]: formatted }));
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
  };

  const handleSendCode = async () => {
    if (!formData.phoneNumber.trim()) {
      Alert.alert('오류', '휴대폰 번호를 입력해주세요.');
      return;
    }

    // 전화번호 형식 검증 (하이픈 제거)
    const cleanPhoneNumber = formData.phoneNumber.replace(/-/g, '');
    if (!/^010\d{8}$/.test(cleanPhoneNumber)) {
      Alert.alert('오류', '올바른 휴대폰 번호 형식을 입력해주세요. (010-XXXX-XXXX)');
      return;
    }

    setLoading(true);
    try {
      const response = await apiService.sendVerificationCode(cleanPhoneNumber);
      setIsCodeSent(true);
      setResendTimer(60); // 60초 타이머 시작
      // 백엔드 응답에 인증번호가 포함되어 있음 (개발용)
      Alert.alert('인증번호 발송', response.data.message || '인증번호가 발송되었습니다.');
      setFormData(prev => ({ ...prev, phoneNumber: cleanPhoneNumber }));
    } catch (error: any) {
      Alert.alert('오류', error.message || '인증번호 발송에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    if (!formData.verificationCode.trim()) {
      Alert.alert('오류', '인증번호를 입력해주세요.');
      return;
    }

    if (formData.verificationCode.length !== 6) {
      Alert.alert('오류', '인증번호는 6자리입니다.');
      return;
    }

    setLoading(true);
    try {
      const response = await apiService.verifyCode(
        formData.phoneNumber.replace(/-/g, ''),
        formData.verificationCode
      );
      
      setIsCodeVerified(true);
      Alert.alert('성공', '인증이 완료되었습니다.');
    } catch (error: any) {
      Alert.alert('오류', error.message || '인증번호가 일치하지 않습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (resendTimer > 0) {
      Alert.alert('알림', `${resendTimer}초 후에 재발송이 가능합니다.`);
      return;
    }

    const cleanPhoneNumber = formData.phoneNumber.replace(/-/g, '');
    setLoading(true);
    try {
      const response = await apiService.sendVerificationCode(cleanPhoneNumber);
      setResendTimer(60);
      setIsCodeVerified(false);
      setFormData(prev => ({ ...prev, verificationCode: '' }));
      Alert.alert('인증번호 재발송', response.data.message || '인증번호가 재발송되었습니다.');
    } catch (error: any) {
      Alert.alert('오류', error.message || '인증번호 재발송에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const { phoneNumber, verificationCode, nickname, email, password, confirmPassword } = formData;
    
    if (!phoneNumber.trim() || !verificationCode.trim() || !nickname.trim() || !email.trim() || !password.trim()) {
      Alert.alert('오류', '모든 필수 필드를 입력해주세요.');
      return false;
    }

    // 이메일 형식 검증
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      Alert.alert('오류', '올바른 이메일 형식을 입력해주세요.');
      return false;
    }

    // 닉네임 검증 (2-12자, 한글/영문/숫자/_/- 조합)
    if (!/^[가-힣a-zA-Z0-9_-]{2,12}$/.test(nickname)) {
      Alert.alert('오류', '닉네임은 2~12자의 한글, 영문, 숫자, _, - 조합만 가능합니다.');
      return false;
    }

    // 비밀번호 검증 (6-20자, 특수문자 포함)
    if (password.length < 6 || password.length > 20) {
      Alert.alert('오류', '비밀번호는 6-20자 사이여야 합니다.');
      return false;
    }
    if (!/(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])/.test(password)) {
      Alert.alert('오류', '비밀번호는 특수문자를 포함해야 합니다.');
      return false;
    }

    // 비밀번호 확인
    if (password !== confirmPassword) {
      Alert.alert('오류', '비밀번호가 일치하지 않습니다.');
      return false;
    }

    // 약관 동의 확인
    if (!termsAgreed || !privacyAgreed) {
      Alert.alert('오류', '이용약관과 개인정보처리방침에 동의해주세요.');
      return false;
    }

    return true;
  };

  const handleSignUp = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const response = await apiService.signUp({
        phoneNumber: formData.phoneNumber.replace(/-/g, ''),
        verificationCode: formData.verificationCode,
        email: formData.email,
        nickname: formData.nickname,
        password: formData.password,
        agreeToTerms: termsAgreed,
        agreeToPrivacy: privacyAgreed,
      });

      // JWT 토큰 저장
      if (response.data.token) {
        apiService.setToken(response.data.token);
        // TODO: AsyncStorage에 토큰 저장
        // await AsyncStorage.setItem('jwt_token', response.data.token);
        // await AsyncStorage.setItem('user_info', JSON.stringify(response.data.user));
      }

      Alert.alert('알림', '회원가입이 완료되었습니다.', [
        {
          text: '확인',
          onPress: () => navigation.navigate('Main'),
        },
      ]);
    } catch (error: any) {
      Alert.alert('오류', error.message || '회원가입에 실패했습니다.');
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
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.headerContainer}>
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => navigation.goBack()}
              accessibilityLabel="뒤로가기"
            >
              <Text style={styles.backButtonText}>←</Text>
            </TouchableOpacity>
            
            <View style={styles.header}>
              <Text style={styles.title}>회원가입</Text>
              <Text style={styles.subtitle}>체리픽에 오신 것을 환영합니다</Text>
            </View>
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
                  maxLength={13}
                />
                <TouchableOpacity
                  style={[
                    styles.sendCodeButton,
                    resendTimer > 0 && styles.sendCodeButtonDisabled,
                  ]}
                  onPress={isCodeSent ? handleResendCode : handleSendCode}
                  disabled={loading || resendTimer > 0}
                >
                  <Text style={styles.sendCodeButtonText}>
                    {resendTimer > 0 
                      ? `재발송 ${resendTimer}s`
                      : isCodeSent 
                        ? '재발송' 
                        : '인증번호'
                    }
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {isCodeSent && (
              <View style={styles.inputContainer}>
                <Text style={styles.label}>인증번호 *</Text>
                <View style={styles.verificationRow}>
                  <TextInput
                    style={[styles.input, styles.verificationInput]}
                    placeholder="인증번호 6자리 입력"
                    value={formData.verificationCode}
                    onChangeText={(value) => handleInputChange('verificationCode', value)}
                    keyboardType="number-pad"
                    maxLength={6}
                  />
                  <TouchableOpacity
                    style={[
                      styles.verifyButton,
                      isCodeVerified && styles.verifyButtonSuccess,
                    ]}
                    onPress={handleVerifyCode}
                    disabled={loading || formData.verificationCode.length !== 6 || isCodeVerified}
                  >
                    <Text style={styles.verifyButtonText}>
                      {isCodeVerified ? '완료' : '확인'}
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
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>이메일 *</Text>
              <TextInput
                style={styles.input}
                placeholder="user@example.com"
                value={formData.email}
                onChangeText={(value) => handleInputChange('email', value)}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>비밀번호 *</Text>
              <TextInput
                style={[
                  styles.input,
                  formData.password && (getPasswordStrength().level >= 2 ? styles.inputSuccess : styles.inputError)
                ]}
                placeholder="특수문자 포함 6-20자"
                value={formData.password}
                onChangeText={(value) => handleInputChange('password', value)}
                secureTextEntry
                autoCapitalize="none"
              />
              {formData.password.length > 0 && (
                <View style={styles.passwordStrength}>
                  <View style={styles.strengthIndicator}>
                    <View style={[
                      styles.strengthBar,
                      { backgroundColor: getPasswordStrength().level >= 1 ? getPasswordStrength().color : '#E0E0E0' }
                    ]} />
                    <View style={[
                      styles.strengthBar,
                      { backgroundColor: getPasswordStrength().level >= 2 ? getPasswordStrength().color : '#E0E0E0' }
                    ]} />
                    <View style={[
                      styles.strengthBar,
                      { backgroundColor: getPasswordStrength().level >= 3 ? getPasswordStrength().color : '#E0E0E0' }
                    ]} />
                  </View>
                  <Text style={[styles.strengthText, { color: getPasswordStrength().color }]}>
                    {getPasswordStrength().text}
                  </Text>
                </View>
              )}
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>비밀번호 확인 *</Text>
              <TextInput
                style={[
                  styles.input,
                  formData.confirmPassword && (isPasswordMatching() ? styles.inputSuccess : styles.inputError)
                ]}
                placeholder="비밀번호를 다시 입력하세요"
                value={formData.confirmPassword}
                onChangeText={(value) => handleInputChange('confirmPassword', value)}
                secureTextEntry
                autoCapitalize="none"
              />
              {formData.confirmPassword.length > 0 && (
                <Text style={[
                  styles.validationText,
                  { color: isPasswordMatching() ? '#28A745' : '#DC3545' }
                ]}>
                  {isPasswordMatching() ? '✓ 비밀번호가 일치합니다' : '✗ 비밀번호가 일치하지 않습니다'}
                </Text>
              )}
            </View>

            {/* 약관 동의 */}
            <View style={styles.termsContainer}>
              <TouchableOpacity
                style={styles.checkboxRow}
                onPress={() => setTermsAgreed(!termsAgreed)}
                accessibilityRole="checkbox"
                accessibilityState={{ checked: termsAgreed }}
              >
                <View style={[styles.checkbox, termsAgreed && styles.checkboxChecked]}>
                  {termsAgreed && <Text style={styles.checkmark}>✓</Text>}
                </View>
                <Text style={styles.checkboxText}>
                  <Text style={styles.required}>*</Text> 이용약관에 동의합니다
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.checkboxRow}
                onPress={() => setPrivacyAgreed(!privacyAgreed)}
                accessibilityRole="checkbox"
                accessibilityState={{ checked: privacyAgreed }}
              >
                <View style={[styles.checkbox, privacyAgreed && styles.checkboxChecked]}>
                  {privacyAgreed && <Text style={styles.checkmark}>✓</Text>}
                </View>
                <Text style={styles.checkboxText}>
                  <Text style={styles.required}>*</Text> 개인정보처리방침에 동의합니다
                </Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={[
                styles.signUpButton,
                (!isCodeSent || !isCodeVerified || 
                 !formData.nickname.trim() || !formData.email.trim() ||
                 !formData.password.trim() || !formData.confirmPassword.trim() ||
                 !termsAgreed || !privacyAgreed) && styles.signUpButtonDisabled,
              ]}
              onPress={handleSignUp}
              disabled={
                loading || !isCodeSent || !isCodeVerified ||
                !formData.nickname.trim() || !formData.email.trim() ||
                !formData.password.trim() || !formData.confirmPassword.trim() ||
                !termsAgreed || !privacyAgreed
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

          <View style={styles.bottomTerms}>
            <Text style={styles.bottomTermsText}>
              가입 시 위 약관에 동의한 것으로 간주됩니다.
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
    paddingTop: 20,
    paddingBottom: 24,
  },
  headerContainer: {
    marginBottom: 40,
  },
  backButton: {
    alignSelf: 'flex-start',
    padding: 8,
    marginBottom: 20,
  },
  backButtonText: {
    fontSize: 24,
    color: '#333333',
    fontWeight: 'bold',
  },
  header: {
    alignItems: 'center',
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
  termsContainer: {
    marginVertical: 20,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    borderRadius: 4,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  checkboxChecked: {
    backgroundColor: '#FF6B6B',
    borderColor: '#FF6B6B',
  },
  checkmark: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  checkboxText: {
    flex: 1,
    fontSize: 14,
    color: '#333333',
  },
  required: {
    color: '#FF6B6B',
    fontWeight: 'bold',
  },
  bottomTerms: {
    paddingHorizontal: 16,
    marginTop: 10,
  },
  bottomTermsText: {
    fontSize: 11,
    color: '#999999',
    textAlign: 'center',
    lineHeight: 14,
  },
  // 실시간 검증 스타일
  inputSuccess: {
    borderColor: '#28A745',
  },
  inputError: {
    borderColor: '#DC3545',
  },
  passwordStrength: {
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  strengthIndicator: {
    flexDirection: 'row',
    flex: 1,
    marginRight: 12,
  },
  strengthBar: {
    height: 4,
    flex: 1,
    marginRight: 4,
    borderRadius: 2,
  },
  strengthText: {
    fontSize: 12,
    fontWeight: '600',
  },
  validationText: {
    fontSize: 12,
    marginTop: 4,
    fontWeight: '500',
  },
  // 인증번호 확인 관련 스타일
  verificationRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  verificationInput: {
    flex: 1,
    marginRight: 12,
  },
  verifyButton: {
    backgroundColor: '#FF6B6B',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderRadius: 8,
  },
  verifyButtonSuccess: {
    backgroundColor: '#28A745',
  },
  verifyButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
});