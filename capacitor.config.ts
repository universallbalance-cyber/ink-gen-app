import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.inkgenpro.app',
  appName: 'Ink Gen Pro',
  webDir: 'docs',
  plugins: {
    StatusBar: {
      overlaysWebView: false,
      style: 'DARK',
      backgroundColor: '#050505'
    }
  }
};

export default config;
