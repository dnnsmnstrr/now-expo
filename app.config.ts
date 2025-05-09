import { ExpoConfig, ConfigContext } from 'expo/config';

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: 'Now Page',
  slug: 'now-page',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/icon.png',
  scheme: 'your-app-scheme',
  userInterfaceStyle: 'automatic',
  splash: {
    image: './assets/splash.png',
    resizeMode: 'contain',
    backgroundColor: '#ffffff'
  },
  updates: {
    fallbackToCacheTimeout: 0,
    url: "https://u.expo.dev/11b66978-2637-4978-b7aa-80c5df230852"
  },
  assetBundlePatterns: [
    '**/*'
  ],
  ios: {
    supportsTablet: true,
    bundleIdentifier: 'com.yourcompany.nowpage'
  },
  android: {
    adaptiveIcon: {
      foregroundImage: './assets/adaptive-icon.png',
      backgroundColor: '#FFFFFF'
    },
    package: 'com.yourcompany.nowpage'
  },
  web: {
    favicon: './assets/favicon.png',
    output: 'server'
  },
  plugins: [
    'expo-router',
    'expo-web-browser'
  ],
  runtimeVersion: {
    "policy": "appVersion"
  },
  experiments: {
    typedRoutes: true
  }
});