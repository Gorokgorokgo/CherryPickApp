import React from 'react';
import {
  View,
  ActivityIndicator,
  Text,
  StyleSheet,
  Modal,
} from 'react-native';

interface LoadingProps {
  visible: boolean;
  message?: string;
  overlay?: boolean;
  size?: 'small' | 'large';
  color?: string;
}

export default function Loading({
  visible,
  message = '로딩 중...',
  overlay = true,
  size = 'large',
  color = '#FF6B6B',
}: LoadingProps) {
  const content = (
    <View style={[
      styles.container,
      overlay ? styles.overlayContainer : styles.inlineContainer
    ]}>
      <View style={styles.loadingBox}>
        <ActivityIndicator 
          size={size} 
          color={color}
          accessibilityLabel="로딩 중"
        />
        {message && (
          <Text 
            style={styles.message}
            accessibilityLabel={message}
          >
            {message}
          </Text>
        )}
      </View>
    </View>
  );

  if (overlay) {
    return (
      <Modal
        visible={visible}
        transparent
        animationType="fade"
        accessibilityViewIsModal
      >
        {content}
      </Modal>
    );
  }

  return visible ? content : null;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlayContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  inlineContainer: {
    backgroundColor: 'transparent',
  },
  loadingBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  message: {
    marginTop: 16,
    fontSize: 16,
    color: '#333333',
    textAlign: 'center',
  },
});