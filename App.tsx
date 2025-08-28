/**
 * 체리픽 React Native App
 * @format
 */

import React from 'react';
import { StatusBar, useColorScheme, Platform } from 'react-native';
import { SafeAreaProvider, initialWindowMetrics } from 'react-native-safe-area-context';
import AppNavigator from './src/navigation/AppNavigator';

function App() {
  const isDarkMode = useColorScheme() === 'dark';

  return (
    <SafeAreaProvider initialMetrics={initialWindowMetrics}>
      <StatusBar 
        barStyle="dark-content"
        backgroundColor="#FFFFFF"
        translucent={Platform.OS === 'android'}
      />
      <AppNavigator />
    </SafeAreaProvider>
  );
}

export default App;
