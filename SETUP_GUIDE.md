# PokeExplorer - Setup & Run Guide

## Prerequisites

Before running the project, ensure you have:

### Required Software
- **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
- **npm** or **yarn** package manager
- **React Native CLI** - Install globally: `npm install -g react-native-cli`

### For iOS Development (macOS only)
- **Xcode** (latest version) - [Download from App Store](https://apps.apple.com/us/app/xcode/id497799835)
- **CocoaPods** - Install: `sudo gem install cocoapods`
- **iOS Simulator** (comes with Xcode)

### For Android Development
- **Android Studio** - [Download](https://developer.android.com/studio)
- **Java Development Kit (JDK)** 11 or higher
- **Android SDK** (installed via Android Studio)
- **Android Emulator** or physical device with USB debugging enabled

## Step-by-Step Setup

### 1. Install Dependencies

```bash
# Navigate to project directory
cd PokeExplorer

# Install npm packages
npm install
# OR
yarn install
```

### 2. iOS Setup (macOS only)

```bash
# Navigate to iOS directory
cd ios

# Install CocoaPods dependencies
pod install

# Return to root directory
cd ..
```

**Note:** If you encounter CocoaPods issues:
```bash
# Update CocoaPods
sudo gem install cocoapods

# Clean and reinstall
cd ios
rm -rf Pods Podfile.lock
pod install
cd ..
```

### 3. Android Setup

#### Configure Android SDK
1. Open Android Studio
2. Go to **Tools → SDK Manager**
3. Install:
   - Android SDK Platform 33 (or latest)
   - Android SDK Build-Tools
   - Android Emulator
   - Google Play services

#### Set Environment Variables (Windows)
Add to your system environment variables:
```
ANDROID_HOME=C:\Users\YourUsername\AppData\Local\Android\Sdk
```

Add to PATH:
```
%ANDROID_HOME%\platform-tools
%ANDROID_HOME%\tools
%ANDROID_HOME%\tools\bin
```

#### Set Environment Variables (macOS/Linux)
Add to `~/.bash_profile` or `~/.zshrc`:
```bash
export ANDROID_HOME=$HOME/Library/Android/sdk
export PATH=$PATH:$ANDROID_HOME/emulator
export PATH=$PATH:$ANDROID_HOME/platform-tools
export PATH=$PATH:$ANDROID_HOME/tools
export PATH=$PATH:$ANDROID_HOME/tools/bin
```

### 4. Firebase Configuration

#### Create Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click **Add Project**
3. Follow the setup wizard
4. Enable **Authentication** → **Email/Password**
5. Enable **Realtime Database** (start in test mode for development)

#### Add iOS App
1. In Firebase Console, click **Add App** → iOS
2. Register app with bundle ID (check `ios/PokeExplorer/Info.plist`)
3. Download `GoogleService-Info.plist`
4. Place it in `ios/PokeExplorer/` directory

#### Add Android App
1. In Firebase Console, click **Add App** → Android
2. Register app with package name (check `android/app/build.gradle`)
3. Download `google-services.json`
4. Place it in `android/app/` directory

### 5. Configure Permissions

#### iOS Permissions (`ios/PokeExplorer/Info.plist`)
Add these keys:
```xml
<key>NSLocationWhenInUseUsageDescription</key>
<string>We need your location to find Pokemon nearby</string>
<key>NSCameraUsageDescription</key>
<string>We need camera access for AR features</string>
<key>NSMicrophoneUsageDescription</key>
<string>We need microphone access for voice search</string>
```

#### Android Permissions (`android/app/src/main/AndroidManifest.xml`)
Ensure these permissions exist:
```xml
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
<uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />
<uses-permission android:name="android.permission.CAMERA" />
<uses-permission android:name="android.permission.RECORD_AUDIO" />
<uses-permission android:name="android.permission.POST_NOTIFICATIONS" />
```

## Running the App

### Start Metro Bundler

In a terminal, run:
```bash
npm start
# OR
yarn start
```

This starts the Metro bundler. Keep this terminal open.

### Run on iOS

**Option 1: Using npm script**
```bash
npm run ios
```

**Option 2: Using React Native CLI**
```bash
react-native run-ios
```

**Option 3: Run on specific simulator**
```bash
react-native run-ios --simulator="iPhone 14 Pro"
```

**Option 4: Using Xcode**
1. Open `ios/PokeExplorer.xcworkspace` (NOT .xcodeproj)
2. Select a simulator
3. Click Run (▶️)

### Run on Android

**Prerequisites:**
- Start Android Emulator OR connect physical device
- Enable USB debugging on physical device

**Option 1: Using npm script**
```bash
npm run android
```

**Option 2: Using React Native CLI**
```bash
react-native run-android
```

**Option 3: Using Android Studio**
1. Open `android/` folder in Android Studio
2. Wait for Gradle sync
3. Click Run (▶️)

## Quick Start Commands

```bash
# Install dependencies
npm install

# iOS (macOS only)
cd ios && pod install && cd ..
npm run ios

# Android
npm run android

# Start Metro bundler separately
npm start

# Clear cache and restart
npm start -- --reset-cache
```

## Troubleshooting

### Metro Bundler Issues

**Clear cache:**
```bash
npm start -- --reset-cache
```

**Clear watchman (if installed):**
```bash
watchman watch-del-all
```

### iOS Build Issues

**Clean build:**
```bash
cd ios
rm -rf build
rm -rf Pods
pod install
cd ..
npm run ios
```

**Xcode cache:**
1. In Xcode: Product → Clean Build Folder (Shift+Cmd+K)
2. Delete DerivedData: `rm -rf ~/Library/Developer/Xcode/DerivedData`

### Android Build Issues

**Clean Gradle:**
```bash
cd android
./gradlew clean
cd ..
npm run android
```

**Invalidate caches in Android Studio:**
File → Invalidate Caches / Restart

### Common Errors

**"Unable to resolve module"**
```bash
npm install
npm start -- --reset-cache
```

**"Command not found: react-native"**
```bash
npm install -g react-native-cli
```

**Firebase not configured**
- Ensure `GoogleService-Info.plist` (iOS) and `google-services.json` (Android) are in correct locations
- Check Firebase project settings match app bundle ID/package name

**Permission denied errors**
- Check that permissions are declared in Info.plist (iOS) and AndroidManifest.xml (Android)
- Grant permissions when prompted on device/simulator

## Testing on Physical Devices

### iOS Device
1. Connect iPhone via USB
2. Trust computer on iPhone
3. In Xcode: Select your device from device list
4. You may need to sign with your Apple Developer account

### Android Device
1. Enable **Developer Options** on phone
2. Enable **USB Debugging**
3. Connect via USB
4. Run `adb devices` to verify connection
5. Run `npm run android`

## Development Tips

1. **Hot Reload**: Enabled by default. Shake device or press `Cmd+D` (iOS) / `Cmd+M` (Android) for dev menu
2. **Debugging**: Use React Native Debugger or Chrome DevTools
3. **Logs**: 
   - iOS: `react-native log-ios`
   - Android: `react-native log-android`
4. **Performance**: Use React DevTools Profiler

## Next Steps

After successful setup:
1. Create a test account in the app
2. Test all features (Pokedex, Hunt, AR, etc.)
3. Check Firebase console for data
4. Test on both iOS and Android if possible

## Need Help?

- Check React Native docs: https://reactnative.dev/docs/getting-started
- Firebase setup: https://rnfirebase.io/
- Project README.md for more details

