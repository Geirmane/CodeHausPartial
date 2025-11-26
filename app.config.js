module.exports = {
  expo: {
    name: "PokeExplorer",
    slug: "pokeexplorer",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/icon.png",
    userInterfaceStyle: "light",
    splash: {
      image: "./assets/splash.png",
      resizeMode: "contain",
      backgroundColor: "#2E7D32"
    },
    assetBundlePatterns: [
      "**/*"
    ],
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.pokeexplorer.app",
      infoPlist: {
        NSLocationWhenInUseUsageDescription: "We need your location to find Pokemon nearby",
        NSCameraUsageDescription: "We need camera access for AR features",
        NSMicrophoneUsageDescription: "We need microphone access for voice search"
      }
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/adaptive-icon.png",
        backgroundColor: "#2E7D32"
      },
      package: "com.pokeexplorer.app",
      permissions: [
        "ACCESS_FINE_LOCATION",
        "ACCESS_COARSE_LOCATION",
        "CAMERA",
        "RECORD_AUDIO",
        "POST_NOTIFICATIONS"
      ]
    },
    web: {
      favicon: "./assets/favicon.png"
    },
    plugins: [
      [
        "expo-location",
        {
          locationAlwaysAndWhenInUsePermission: "Allow PokeExplorer to use your location to find Pokemon nearby."
        }
      ],
      [
        "expo-camera",
        {
          cameraPermission: "Allow PokeExplorer to access your camera for AR features."
        }
      ],
      [
        "expo-notifications",
        {
          icon: "./assets/notification-icon.png",
          color: "#2E7D32"
        }
      ],
      [
        "expo-av",
        {
          microphonePermission: "Allow PokeExplorer to access your microphone for voice search."
        }
      ]
    ],
    extra: {
      eas: {
        projectId: "your-project-id"
      }
    }
  }
};


