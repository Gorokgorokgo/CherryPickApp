# CherryPick - 중고물품 경매 앱

React Native로 개발된 중고물품 경매 모바일 애플리케이션입니다.

## 🚀 빠른 시작

### 필수 요구사항
- Node.js >= 18
- React Native CLI
- Android Studio (Android 개발)
- Xcode (iOS 개발)

### 설치 및 실행

```bash
# 프로젝트 클론
git clone <repository-url>
cd CherryPickApp

# 의존성 설치
npm install

# Android 실행
npm run android

# iOS 실행 (macOS만)
npm run ios

# Metro 서버 시작
npm start
```

## 📱 앱 사용 방법

### 1. 앱 시작
- 스플래시 화면 후 자동으로 홈 화면으로 이동
- 개발 모드에서는 로그인 없이 바로 사용 가능

### 2. 주요 기능

#### 🏠 홈 화면
- 경매 목록 확인
- 검색창 터치 → 상세 검색 모달
- 필터/정렬 기능
- 경매 카드 터치 → 상세 화면

#### ➕ 경매 등록
- 홈 화면 우하단 + 버튼 터치
- 3단계 진행:
  1. **상품 정보**: 제목, 설명, 카테고리
  2. **경매 설정**: 시작가, 즉구가, 기간, 상태
  3. **거래 정보**: 거래 지역 확인 후 등록

#### 📄 경매 상세
- 이미지 갤러리 (좌우 스와이프)
- 실시간 가격 업데이트
- 입찰 내역 확인
- 입찰하기 버튼

#### 📋 내 경매
- **판매 탭**: 내가 등록한 경매
- **입찰 탭**: 내가 입찰한 경매
- 상태별 필터링 (진행중/종료)

#### 👤 프로필
- **포인트 관리**: 포인트 충전/사용 내역
- **거래 내역**: 완료된 거래 목록
- **설정**: 알림, 개인정보 등

### 3. 핸드폰에 설치하기

#### 📱 디버그 APK (개발용)
```bash
# 디버그 APK 빌드
cd android
gradlew assembleDebug

# 생성된 APK 위치
# android/app/build/outputs/apk/debug/app-debug.apk
```

#### 🚀 릴리즈 APK (배포용)
```bash
# 릴리즈 APK 빌드  
cd android
gradlew assembleRelease

# 생성된 APK 위치
# android/app/build/outputs/apk/release/app-release-unsigned.apk
```

#### 📦 설치 방법
1. APK 파일을 핸드폰으로 복사 (USB, 클라우드, 메신저 등)
2. **설정 → 보안 → 알 수 없는 출처** 허용
3. 파일 매니저에서 APK 터치하여 설치

> **💡 팁**: 디버그 버전은 크기가 크고 느리지만 개발용으로 적합하며, 릴리즈 버전은 최적화되어 실제 사용에 권장됩니다.

## 🛠️ 개발 환경

### 테스트 실행
```bash
# 단위 테스트
npm test

# 테스트 커버리지
npm test -- --coverage
```

### 타입 체크
```bash
npx tsc --noEmit
```

### 코드 린팅
```bash
npm run lint
```

## 📁 프로젝트 구조

```
src/
├── components/          # 재사용 컴포넌트
│   ├── common/         # 공통 컴포넌트 (Button, Input 등)
│   └── auction/        # 경매 관련 컴포넌트
├── screens/            # 화면 컴포넌트
│   ├── home/          # 홈 화면
│   ├── auction/       # 경매 관련 화면
│   ├── profile/       # 프로필 화면
│   └── auth/          # 인증 화면
├── navigation/         # 네비게이션 설정
├── utils/             # 유틸리티 함수
├── constants/         # 상수 정의
├── hooks/             # 커스텀 훅
└── types/             # TypeScript 타입 정의
```

## 🔧 개발용 설정

### 백엔드 연동 준비
1. `src/screens/SplashScreen.tsx`에서 24번째 줄 수정:
   ```typescript
   navigation.replace('Auth'); // 로그인 화면으로
   ```

2. API 엔드포인트 설정:
   ```typescript
   // src/constants/index.ts
   BASE_URL: 'http://your-backend-url:8080/api'
   ```

### 로그인/회원가입 테스트
- 프로필 화면에서 "로그인 테스트", "회원가입 테스트" 메뉴 사용
- 또는 스플래시 화면 설정 변경

## 📋 주요 기능

✅ **완료된 기능**
- 홈 화면 (검색, 필터링, 정렬)
- 경매 등록 (3단계 폼)
- 경매 상세 (실시간 입찰)
- 내 경매 관리 (판매/입찰)
- 프로필 관리 (포인트, 설정)
- TDD 테스트 코드
- 타입 안전성 (TypeScript)
- 접근성 지원

🚧 **백엔드 연동 예정**
- 실제 API 통신
- 인증/인가
- 실시간 알림
- 결제 시스템

## 🎯 사용 기술

- **Frontend**: React Native 0.81, TypeScript
- **Navigation**: React Navigation 7
- **Icons**: React Native Vector Icons
- **Testing**: Jest, React Native Testing Library
- **State Management**: React Hooks (Context API 예정)
- **Backend**: Spring Boot (별도 리포지토리)

---

**체리픽으로 특별한 경매 경험을 즐겨보세요!** 🍒✨