import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import MapView, {Marker} from 'react-native-maps';
import {useNavigation} from '@react-navigation/native';
import {useAuth} from '../../context/AuthContext';
import {usePokemon} from '../../context/PokemonContext';
import {useTheme} from '../../context/ThemeContext';
import {
  requestLocationPermission,
  getCurrentLocation,
  watchPosition,
  generatePokemonEncounter,
  clearLocationWatch,
} from '../../services/locationService';
import {PokemonEncounter} from '../../types';
import {fetchPokemonList} from '../../services/pokeApiService';
import PushNotification from 'react-native-push-notification';
import {NOTIFICATION_CONFIG} from '../../constants/config';

const HuntScreen: React.FC = () => {
  const [location, setLocation] = useState<{latitude: number; longitude: number} | null>(null);
  const [encounters, setEncounters] = useState<PokemonEncounter[]>([]);
  const [pokemonIds, setPokemonIds] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const {user} = useAuth();
  const {getPokemon} = usePokemon();
  const {colors} = useTheme();
  const navigation = useNavigation();

  useEffect(() => {
    initializeHunt();
    return () => {
      clearLocationWatch();
    };
  }, []);

  const initializeHunt = async () => {
    try {
      // Request location permission
      const hasPermission = await requestLocationPermission();
      if (!hasPermission) {
        Alert.alert(
          'Permission Required',
          'Location permission is required for Pokemon hunting',
        );
        setLoading(false);
        return;
      }

      // Load Pokemon list
      const ids = await fetchPokemonList(200);
      setPokemonIds(ids);

      // Get current location
      const currentLocation = await getCurrentLocation();
      setLocation({
        latitude: currentLocation.latitude,
        longitude: currentLocation.longitude,
      });

      // Generate initial encounters
      generateEncounters(currentLocation, ids);

      // Watch position for updates
      watchPosition(updatedLocation => {
        setLocation({
          latitude: updatedLocation.latitude,
          longitude: updatedLocation.longitude,
        });
        generateEncounters(updatedLocation, ids);
      });
    } catch (error) {
      console.error('Error initializing hunt:', error);
      Alert.alert('Error', 'Failed to initialize Pokemon hunt');
    } finally {
      setLoading(false);
    }
  };

  const generateEncounters = (
    loc: {latitude: number; longitude: number},
    ids: number[],
  ) => {
    const newEncounters: PokemonEncounter[] = [];
    // Generate 3-5 random encounters
    const numEncounters = Math.floor(Math.random() * 3) + 3;
    for (let i = 0; i < numEncounters; i++) {
      const encounter = generatePokemonEncounter(
        {latitude: loc.latitude + (Math.random() - 0.5) * 0.01, longitude: loc.longitude + (Math.random() - 0.5) * 0.01},
        ids,
      );
      if (encounter) {
        newEncounters.push(encounter);
      }
    }
    setEncounters(newEncounters);

    // Send notification for nearby Pokemon
    if (newEncounters.length > 0) {
      PushNotification.localNotification({
        channelId: NOTIFICATION_CONFIG.CHANNEL_ID,
        title: 'Pokemon Nearby!',
        message: `${newEncounters.length} Pokemon discovered in your area!`,
        playSound: true,
        soundName: 'default',
      });
    }
  };

  const handleEncounterPress = async (encounter: PokemonEncounter) => {
    const pokemon = await getPokemon(encounter.pokemonId);
    if (pokemon) {
      navigation.navigate('PokemonDetail' as never, {pokemon} as never);
    }
  };

  if (loading || !location) {
    return (
      <View style={[styles.container, styles.loadingContainer, {backgroundColor: colors.background}]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, {color: colors.textSecondary}]}>
          Loading map...
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, {backgroundColor: colors.background}]}>
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: location.latitude,
          longitude: location.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }}
        showsUserLocation
        showsMyLocationButton>
        {encounters.map((encounter, index) => (
          <Marker
            key={index}
            coordinate={{
              latitude: encounter.location.latitude,
              longitude: encounter.location.longitude,
            }}
            title={`Pokemon #${encounter.pokemonId}`}
            description={`Found in ${encounter.biome}`}
            onPress={() => handleEncounterPress(encounter)}>
            <View style={[styles.markerContainer, {backgroundColor: colors.primary}]}>
              <Text style={styles.markerText}>🎮</Text>
            </View>
          </Marker>
        ))}
      </MapView>

      <View style={[styles.infoPanel, {backgroundColor: colors.surface}]}>
        <Text style={[styles.infoText, {color: colors.text}]}>
          {encounters.length} Pokemon nearby
        </Text>
        <TouchableOpacity
          style={[styles.refreshButton, {backgroundColor: colors.primary}]}
          onPress={() => location && generateEncounters(location, pokemonIds)}>
          <Text style={styles.refreshButtonText}>Refresh</Text>
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
  map: {
    flex: 1,
  },
  markerContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  markerText: {
    fontSize: 20,
  },
  infoPanel: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  infoText: {
    fontSize: 16,
    fontWeight: '600',
  },
  refreshButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  refreshButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default HuntScreen;

