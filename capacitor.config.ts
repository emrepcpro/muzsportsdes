import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.muzsports.app',
  appName: 'MuzSports',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  }
};

export default config;
