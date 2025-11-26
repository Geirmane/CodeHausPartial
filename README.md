# PokeExplorer 🎮

An interactive, augmented reality-enhanced Pokedex mobile app built with React Native. Explore, discover, and catalog Pokémon in real-world contexts using geolocation, AR overlays, and device sensors.

## Features

- 🔐 **User Authentication**: Login/signup with email or social providers via Firebase
- 📱 **Pokedex Core**: Browse, search, and view detailed Pokémon information from PokeAPI
- 🗺️ **Geolocation Discovery**: Hunt for Pokémon based on your real-world location
- 🥽 **AR/VR Elements**: Overlay Pokémon on camera feed and 360° habitat views
- 📷 **Camera & Voice**: Capture Pokémon with AR overlays and voice search
- 🎨 **Multimedia**: Load and display GIFs/images with lazy loading
- 📤 **Social Sharing**: Share discoveries to social media and community feed
- 🏆 **Gamification**: Badges, points, and daily challenges

## Prerequisites

- Node.js >= 18
- React Native CLI
- Xcode (for iOS development)
- Android Studio (for Android development)
- Firebase account
- CocoaPods (for iOS)

## Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd PokeExplorer
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **iOS Setup**
   ```bash
   cd ios
   pod install
   cd ..
   ```

4. **Configure Environment Variables**
   ```bash
   cp .env.example .env
   # Edit .env with your Firebase and API keys
   ```

5. **Firebase Setup**
   - Create a Firebase project at https://console.firebase.google.com
   - Add iOS and Android apps to your Firebase project
   - Download `google-services.json` (Android) and `GoogleService-Info.plist` (iOS)
   - Place them in `android/app/` and `ios/` respectively

6. **Run the app**
   ```bash
   # iOS
   npm run ios
   
   # Android
   npm run android
   ```

## Project Structure

```
PokeExplorer/
├── src/
│   ├── components/       # Reusable UI components
│   ├── screens/          # Screen components
│   ├── navigation/       # Navigation configuration
│   ├── services/         # API and external services
│   ├── context/          # Context API for state management
│   ├── utils/            # Utility functions
│   ├── constants/        # App constants and themes
│   └── types/            # TypeScript type definitions
├── android/              # Android native code
├── ios/                  # iOS native code
├── __tests__/            # Test files
└── assets/               # Images, fonts, etc.
```

## Key Libraries

- **React Navigation**: Navigation between screens
- **Firebase**: Authentication and Realtime Database
- **PokeAPI**: Pokémon data
- **react-native-maps**: Map view for geolocation
- **react-native-vision-camera**: Camera functionality
- **react-native-permissions**: Handle device permissions
- **AsyncStorage**: Local data persistence

## Development Guidelines

1. **Code Style**: Follow React Native best practices and ESLint rules
2. **Commits**: Use clear commit messages. All team members should commit regularly
3. **Branching**: Use feature branches and merge via pull requests
4. **Testing**: Write unit tests for API integrations and utilities
5. **Documentation**: Comment complex logic and update README as needed

## Permissions Required

- **Location**: For geolocation-based Pokémon discovery
- **Camera**: For AR overlays and photo capture
- **Microphone**: For voice search
- **Notifications**: For nearby Pokémon alerts

## Platform-Specific Notes

### iOS
- Requires iOS 13.0+
- Camera and location permissions must be configured in `Info.plist`

### Android
- Requires Android 6.0+ (API level 23+)
- Permissions must be declared in `AndroidManifest.xml`

## Testing

```bash
npm test
```

## Troubleshooting

- **Metro bundler issues**: Clear cache with `npm start -- --reset-cache`
- **iOS build errors**: Run `cd ios && pod install && cd ..`
- **Android build errors**: Clean with `cd android && ./gradlew clean && cd ..`

## Contributing

1. Create a feature branch
2. Make your changes
3. Write/update tests
4. Submit a pull request

## License

This project is for educational purposes as part of IT5103N Advanced Mobile Development course.

## Team Members

- [Add team member names here]

## Acknowledgments

- PokeAPI for Pokémon data
- React Native community for excellent libraries
- Figma community for design inspiration

