# PokeExplorer - Expo Setup Guide

## Quick Start

### 1. Install Dependencies

```bash
npm install
# or
yarn install
```

### 2. Configure Firebase

Create a `.env` file in the root directory:

```env
EXPO_PUBLIC_FIREBASE_API_KEY=your-api-key
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
EXPO_PUBLIC_FIREBASE_DATABASE_URL=https://your-project.firebaseio.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
EXPO_PUBLIC_FIREBASE_APP_ID=your-app-id
```

Update `src/config/firebase.ts` with your Firebase configuration.

### 3. Start the App

```bash
# Start Expo development server
npm start
# or
expo start
```

Then:
- Press `i` for iOS simulator
- Press `a` for Android emulator
- Scan QR code with Expo Go app on your phone

## Running on Different Platforms

### Expo Go (Development)
```bash
npm start
# Scan QR code with Expo Go app
```

### iOS Simulator (macOS only)
```bash
npm run ios
# or
expo start --ios
```

### Android Emulator
```bash
npm run android
# or
expo start --android
```

### Web Browser
```bash
npm run web
# or
expo start --web
```

## Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project
3. Enable **Authentication** → **Email/Password**
4. Enable **Realtime Database** (start in test mode)
5. Copy your Firebase config values to `.env` file

## Important Notes

### Voice Search
Voice search is currently disabled in Expo version as it requires native modules. The UI button is present but shows an alert. For production, you could:
- Use a web-based speech recognition API
- Build a custom development build with native modules
- Use EAS Build to create a development build

### Maps
React Native Maps works with Expo but requires additional setup:
- For iOS: Maps work out of the box
- For Android: You may need to add Google Maps API key in `app.config.js`

### Camera
Expo Camera is fully supported and works in Expo Go.

### Notifications
Expo Notifications work in Expo Go for local notifications. Push notifications require additional setup.

## Building for Production

### Using EAS Build (Recommended)

1. Install EAS CLI:
```bash
npm install -g eas-cli
```

2. Login:
```bash
eas login
```

3. Configure:
```bash
eas build:configure
```

4. Build:
```bash
# iOS
eas build --platform ios

# Android
eas build --platform android

# Both
eas build --platform all
```

### Using Expo Build (Legacy)

```bash
expo build:ios
expo build:android
```

## Troubleshooting

### Clear Cache
```bash
expo start -c
# or
npm start -- --clear
```

### Reset Metro Bundler
```bash
watchman watch-del-all
rm -rf node_modules
npm install
expo start -c
```

### Firebase Connection Issues
- Check your `.env` file has correct values
- Ensure Firebase project has Realtime Database enabled
- Check Firebase rules allow read/write for testing

### Camera Not Working
- Ensure permissions are granted in device settings
- Check `app.config.js` has camera plugin configured
- Try restarting the app

## Differences from Bare React Native

1. **Firebase**: Uses Firebase JS SDK instead of React Native Firebase
2. **Voice Search**: Disabled (requires native modules)
3. **Maps**: May need Google Maps API key for Android
4. **Notifications**: Uses Expo Notifications
5. **Camera**: Uses Expo Camera
6. **Sharing**: Uses Expo Sharing

## Next Steps

1. Set up Firebase project
2. Configure environment variables
3. Test on Expo Go
4. Build development build if you need native modules
5. Build production app with EAS Build


