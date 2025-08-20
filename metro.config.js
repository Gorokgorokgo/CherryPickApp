const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');

const config = {
  server: {
    port: 8082  // 포트 8082로 변경
  }
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);