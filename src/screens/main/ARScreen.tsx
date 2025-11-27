import React, {useState, useEffect, useRef} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Image,
  Platform,
} from 'react-native';
import {
  Camera,
  useCameraDevice,
  useCameraPermission,
  CameraCaptureError,
} from 'react-native-vision-camera';
import Share from 'react-native-share';
import {useNavigation} from '@react-navigation/native';
import {usePokemon} from '../../context/PokemonContext';
import {useAuth} from '../../context/AuthContext';
import {useTheme} from '../../context/ThemeContext';
import {Pokemon} from '../../types';
import {fetchPokemonList} from '../../services/pokeApiService';
import {addDiscoveredPokemon} from '../../services/userService';
import {saveCapturedPhoto} from './GalleryScreen';

const ARScreen: React.FC = () => {
  const [pokemon, setPokemon] = useState<Pokemon | null>(null);
  const [pokemonIds, setPokemonIds] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [capturing, setCapturing] = useState(false);
  const [facing] = useState<'front' | 'back'>('back');
  const cameraRef = useRef<Camera>(null);
  const device = useCameraDevice(facing);
  const {hasPermission, requestPermission} = useCameraPermission();
  const {getPokemon} = usePokemon();
  const {user, updateUser} = useAuth();
  const {colors} = useTheme();
  const navigation = useNavigation();

  useEffect(() => {
    initializeAR();
  }, []);

  const initializeAR = async () => {
    try {
      // Request camera permission
      if (!hasPermission) {
        const granted = await requestPermission();
        if (!granted) {
          Alert.alert('Permission Required', 'Camera permission is required for AR features');
          setLoading(false);
          return;
        }
      }

      // Load Pokemon list
      const ids = await fetchPokemonList(200);
      setPokemonIds(ids);

      // Spawn a random Pokemon
      spawnRandomPokemon(ids);
    } catch (error) {
      console.error('Error initializing AR:', error);
      Alert.alert('Error', 'Failed to initialize AR');
    } finally {
      setLoading(false);
    }
  };

  const spawnRandomPokemon = async (ids: number[]) => {
    if (ids.length === 0) return;
    const randomIndex = Math.floor(Math.random() * ids.length);
    const pokemonData = await getPokemon(ids[randomIndex]);
    if (pokemonData) {
      setPokemon(pokemonData);
    }
  };

  const handleCapture = async () => {
    if (!cameraRef.current || !pokemon) return;

    setCapturing(true);
    try {
      const photo = await cameraRef.current.takePhoto({
        qualityPrioritization: 'balanced',
      });

      const photoUri = Platform.OS === 'android' ? `file://${photo.path}` : photo.path;

      // Mark Pokemon as discovered
      if (user) {
        await addDiscoveredPokemon(user.uid, pokemon.id);
        await updateUser({});
        
        // Save to gallery
        await saveCapturedPhoto(
          user.uid,
          pokemon.id,
          pokemon.name,
          pokemon.sprites.front_default,
          photoUri,
        );
      }

      Alert.alert(
        'Pokemon Captured!',
        `You captured ${pokemon.name}!`,
        [
          {
            text: 'Share',
            onPress: () => handleShare(photoUri),
          },
          {
            text: 'OK',
            onPress: () => spawnRandomPokemon(pokemonIds),
          },
        ],
      );
    } catch (error) {
      if (error instanceof CameraCaptureError) {
        console.error('Camera error:', error);
      } else {
        console.error('Error capturing photo:', error);
      }
      Alert.alert('Error', 'Failed to capture photo');
    } finally {
      setCapturing(false);
    }
  };

  const handleShare = async (photoUri: string) => {
    if (!pokemon) return;

    try {
      await Share.open({
        url: photoUri,
        message: `I captured ${pokemon.name} in AR! #PokeExplorer`,
        failOnCancel: false,
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.loadingContainer, {backgroundColor: colors.background}]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, {color: colors.textSecondary}]}>
          Initializing AR...
        </Text>
      </View>
    );
  }

  if (!hasPermission) {
    return (
      <View style={[styles.container, styles.loadingContainer, {backgroundColor: colors.background}]}>
        <Text style={[styles.errorText, {color: colors.error}]}>
          Camera permission is required
        </Text>
        <TouchableOpacity
          style={[styles.button, {backgroundColor: colors.primary, marginTop: 16}]}
          onPress={requestPermission}>
          <Text style={styles.buttonText}>Request Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {device ? (
        <Camera
          ref={cameraRef}
          style={styles.camera}
          device={device}
          isActive
          photo
        />
      ) : (
        <View style={[styles.camera, styles.loadingContainer]}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      )}

      {/* AR Overlay - Pokemon Sprite */}
      {pokemon && (
        <View style={styles.arOverlay}>
          <View style={styles.pokemonContainer}>
            <Image
              source={{uri: pokemon.sprites.front_default}}
              style={styles.pokemonSprite}
              resizeMode="contain"
            />
            <Text style={[styles.pokemonName, {color: colors.text}]}>
              {pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1)}
            </Text>
          </View>
        </View>
      )}

      {/* Controls */}
      <View style={[styles.controls, {backgroundColor: colors.surface}]}>
        <TouchableOpacity
          style={[styles.captureButton, {backgroundColor: colors.primary}]}
          onPress={handleCapture}
          disabled={capturing || !pokemon}>
          {capturing ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.captureButtonText}>Capture</Text>
          )}
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.spawnButton, {borderColor: colors.primary}]}
          onPress={() => spawnRandomPokemon(pokemonIds)}
          disabled={loading}>
          <Text style={[styles.spawnButtonText, {color: colors.primary}]}>
            Spawn New Pokemon
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
    padding: 16,
  },
  camera: {
    flex: 1,
  },
  arOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pokemonContainer: {
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 16,
    borderRadius: 16,
  },
  pokemonSprite: {
    width: 200,
    height: 200,
    marginBottom: 8,
  },
  pokemonName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    textTransform: 'capitalize',
  },
  controls: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  captureButton: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginRight: 8,
  },
  captureButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  spawnButton: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    borderWidth: 2,
    alignItems: 'center',
    marginLeft: 8,
  },
  spawnButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  button: {
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ARScreen;
