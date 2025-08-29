import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/AppNavigator';

type SplashScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Splash'>;


export default function SplashScreen() {
  const navigation = useNavigation<SplashScreenNavigationProp>();

  useEffect(() => {
    // 로그인 상태 확인 후 적절한 화면으로 이동
    const timer = setTimeout(() => {
      // TODO: AsyncStorage에서 JWT 토큰 확인
      // const token = await AsyncStorage.getItem('jwt_token');
      // if (token) {
      //   navigation.replace('Main');
      // } else {
      //   navigation.replace('Auth');
      // }
      
      // 현재는 로그인 화면으로 이동
      navigation.replace('Auth');
    }, 2000);

    return () => clearTimeout(timer);
  }, [navigation]);

  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        {/* 로고 이미지 자리 */}
        <View style={styles.logoPlaceholder}>
          <Text style={styles.logoText}>🍒</Text>
        </View>
        
        <Text style={styles.appName}>체리픽</Text>
        <Text style={styles.tagline}>당신만의 특별한 경매</Text>
      </View>
      
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>로딩중...</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FF6B6B',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoPlaceholder: {
    width: 120,
    height: 120,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
  },
  logoText: {
    fontSize: 60,
    color: 'white',
  },
  appName: {
    fontSize: 36,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 10,
  },
  tagline: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
  },
  loadingContainer: {
    position: 'absolute',
    bottom: 80,
  },
  loadingText: {
    color: 'white',
    fontSize: 14,
    opacity: 0.7,
  },
});