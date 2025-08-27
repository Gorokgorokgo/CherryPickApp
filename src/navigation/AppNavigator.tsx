import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Icon } from '../components/common';

// Screens
import SplashScreen from '../screens/SplashScreen';
import LoginScreen from '../screens/auth/LoginScreen';
import SignUpScreen from '../screens/auth/SignUpScreen';
import HomeScreen from '../screens/home/HomeScreen';
import AuctionDetailScreen from '../screens/auction/AuctionDetailScreen';
import AuctionCreateScreen from '../screens/auction/AuctionCreateScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';
import MyAuctionsScreen from '../screens/auction/MyAuctionsScreen';

// Point Screens
import PointScreen from '../screens/point/PointScreen';
import PointChargeScreen from '../screens/point/PointChargeScreen';
import PointHistoryScreen from '../screens/point/PointHistoryScreen';

// Bid Screens
import BidScreen from '../screens/bid/BidScreen';
import MyBidsScreen from '../screens/bid/MyBidsScreen';

// Connection Screens
import ConnectionPaymentScreen from '../screens/connection/ConnectionPaymentScreen';

// Chat Screens
import ChatListScreen from '../screens/chat/ChatListScreen';
import ChatRoomScreen from '../screens/chat/ChatRoomScreen';

// Settings Screens
import SettingsScreen from '../screens/settings/SettingsScreen';
import NotificationSettingsScreen from '../screens/settings/NotificationSettingsScreen';

export type RootStackParamList = {
  Splash: undefined;
  Auth: undefined;
  Main: undefined;
  AuctionDetail: { auctionId: string };
  AuctionCreate: undefined;
  
  // Point Screens
  Point: undefined;
  PointCharge: undefined;
  PointHistory: undefined;
  
  // Bid Screens
  Bid: { auctionId: string; currentPrice: number; timeRemaining: Date; title: string };
  MyBids: undefined;
  
  // Connection Screens
  ConnectionPayment: { auctionId: string; title: string; finalPrice: number; sellerName: string; userLevel: number };
  
  // Chat Screens
  ChatList: undefined;
  ChatRoom: { chatRoomId?: string; auctionId: string; title: string; partnerName: string; partnerType: 'seller' | 'buyer'; isOnline?: boolean };
  
  // Settings Screens
  Settings: undefined;
  NotificationSettings: undefined;
};

export type AuthStackParamList = {
  Login: undefined;
  SignUp: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  ChatList: undefined;
  Wishlist: undefined;
  Notifications: undefined;
  Profile: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();
const AuthStack = createStackNavigator<AuthStackParamList>();
const MainTab = createBottomTabNavigator<MainTabParamList>();

function AuthNavigator() {
  return (
    <AuthStack.Navigator screenOptions={{ headerShown: false }}>
      <AuthStack.Screen name="Login" component={LoginScreen} />
      <AuthStack.Screen name="SignUp" component={SignUpScreen} />
    </AuthStack.Navigator>
  );
}

function MainNavigator() {
  return (
    <MainTab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: 'home' | 'chat' | 'favorite' | 'notifications' | 'person';

          if (route.name === 'Home') {
            iconName = 'home';
          } else if (route.name === 'ChatList') {
            iconName = 'chat';
          } else if (route.name === 'Wishlist') {
            iconName = 'favorite';
          } else if (route.name === 'Notifications') {
            iconName = 'notifications';
          } else if (route.name === 'Profile') {
            iconName = 'person';
          } else {
            iconName = 'home';
          }

          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#FF6B6B',
        tabBarInactiveTintColor: '#999999',
        headerShown: false,
      })}
    >
      <MainTab.Screen
        name="Home"
        component={HomeScreen}
        options={{ tabBarLabel: '홈' }}
      />
      <MainTab.Screen
        name="ChatList"
        component={ChatListScreen}
        options={{ tabBarLabel: '채팅' }}
      />
      <MainTab.Screen
        name="Wishlist"
        component={MyAuctionsScreen}
        options={{ tabBarLabel: '찜목록' }}
      />
      <MainTab.Screen
        name="Notifications"
        component={MyAuctionsScreen}
        options={{ tabBarLabel: '알림' }}
      />
      <MainTab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ tabBarLabel: '내정보' }}
      />
    </MainTab.Navigator>
  );
}

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Splash" component={SplashScreen} />
        <Stack.Screen name="Auth" component={AuthNavigator} />
        <Stack.Screen name="Main" component={MainNavigator} />
        <Stack.Screen 
          name="AuctionDetail" 
          component={AuctionDetailScreen}
          options={{ 
            headerShown: true,
            title: '경매 상세',
          }}
        />
        <Stack.Screen 
          name="AuctionCreate" 
          component={AuctionCreateScreen}
          options={{ 
            headerShown: false,
          }}
        />
        
        {/* Point Screens */}
        <Stack.Screen 
          name="Point" 
          component={PointScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name="PointCharge" 
          component={PointChargeScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name="PointHistory" 
          component={PointHistoryScreen}
          options={{ headerShown: false }}
        />
        
        {/* Bid Screens */}
        <Stack.Screen 
          name="Bid" 
          component={BidScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name="MyBids" 
          component={MyBidsScreen}
          options={{ headerShown: false }}
        />
        
        {/* Connection Screens */}
        <Stack.Screen 
          name="ConnectionPayment" 
          component={ConnectionPaymentScreen}
          options={{ headerShown: false }}
        />
        
        {/* Chat Screens */}
        <Stack.Screen 
          name="ChatRoom" 
          component={ChatRoomScreen}
          options={{ headerShown: false }}
        />
        
        {/* Settings Screens */}
        <Stack.Screen 
          name="Settings" 
          component={SettingsScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name="NotificationSettings" 
          component={NotificationSettingsScreen}
          options={{ headerShown: false }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}