import { defineConfig } from '@capacitor/cli';

export default defineConfig({
  appId: 'com.pet.app',
  appName: 'PET App',
  webDir: 'dist/renderer',
  server: {
    androidScheme: 'https',
  },
  android: {
    buildOptions: {
      keystorePath: undefined,
      keystoreAlias: undefined,
    },
  },
});
