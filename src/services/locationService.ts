import {PermissionsAndroid, Platform} from 'react-native';
import Geolocation, {GeoPosition, WatchOptions} from 'react-native-geolocation-service';
import {Location as LocationType, PokemonEncounter} from '../types';
import {BIOMES, BIOME_POKEMON_TYPES} from '../constants/config';

export const requestLocationPermission = async (): Promise<boolean> => {
  if (Platform.OS === 'ios') {
    const status = await Geolocation.requestAuthorization('whenInUse');
    return status === 'granted';
  }

  const granted = await PermissionsAndroid.request(
    PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
    {
      title: 'Location Permission',
      message: 'PokeExplorer needs access to your location to find Pokemon nearby.',
      buttonPositive: 'Allow',
    },
  );
  return granted === PermissionsAndroid.RESULTS.GRANTED;
};

export const getCurrentLocation = async (): Promise<LocationType> => {
  const hasPermission = await requestLocationPermission();
  if (!hasPermission) {
    throw new Error('Permission to access location was denied');
  }

  return new Promise((resolve, reject) => {
    Geolocation.getCurrentPosition(
      (position: GeoPosition) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy ?? undefined,
        });
      },
      error => reject(error),
      {enableHighAccuracy: true, timeout: 15000, maximumAge: 10000},
    );
  });
};

let watchId: number | null = null;

export const watchPosition = (
  callback: (location: LocationType) => void,
  options: WatchOptions = {enableHighAccuracy: true, distanceFilter: 10},
): number => {
  watchId = Geolocation.watchPosition(
    position => {
      callback({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy ?? undefined,
      });
    },
    error => console.warn('Location watch error', error),
    options,
  );

  return watchId ?? 0;
};

export const clearLocationWatch = () => {
  if (watchId !== null) {
    Geolocation.clearWatch(watchId);
    watchId = null;
  }
};

export const determineBiome = (location: LocationType): string => {
  // Simple biome determination based on location
  // In a real app, you might use Google Maps API or other services
  // For now, we'll use a simple heuristic based on coordinates
  
  // This is a placeholder - you would implement actual biome detection
  // For example, checking if near water, elevation, etc.
  const lat = location.latitude;
  const lon = location.longitude;

  // Simple example: determine biome based on coordinate patterns
  // In production, use reverse geocoding or map APIs
  if (Math.abs(lat % 1) < 0.1) {
    return BIOMES.WATER;
  } else if (Math.abs(lon % 1) < 0.1) {
    return BIOMES.FOREST;
  } else if (lat > 0) {
    return BIOMES.URBAN;
  } else {
    return BIOMES.RURAL;
  }
};

export const getBiomePokemonTypes = (biome: string): string[] => {
  return BIOME_POKEMON_TYPES[biome] || BIOME_POKEMON_TYPES[BIOMES.RURAL];
};

export const generatePokemonEncounter = (
  location: LocationType,
  pokemonIds: number[],
): PokemonEncounter | null => {
  const biome = determineBiome(location);
  const availableTypes = getBiomePokemonTypes(biome);

  // Randomly select a Pokemon (in real implementation, filter by type)
  if (pokemonIds.length === 0) return null;

  const randomIndex = Math.floor(Math.random() * pokemonIds.length);
  const pokemonId = pokemonIds[randomIndex];

  return {
    pokemonId,
    location,
    timestamp: new Date(),
    biome,
  };
};

