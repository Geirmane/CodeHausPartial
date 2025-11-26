import * as Location from 'expo-location';
import {Location as LocationType, PokemonEncounter} from '../types';
import {BIOMES, BIOME_POKEMON_TYPES} from '../constants/config';

export const requestLocationPermission = async (): Promise<boolean> => {
  const {status} = await Location.requestForegroundPermissionsAsync();
  return status === 'granted';
};

export const getCurrentLocation = async (): Promise<LocationType> => {
  const {status} = await Location.requestForegroundPermissionsAsync();
  if (status !== 'granted') {
    throw new Error('Permission to access location was denied');
  }

  const location = await Location.getCurrentPositionAsync({
    accuracy: Location.Accuracy.High,
  });

  return {
    latitude: location.coords.latitude,
    longitude: location.coords.longitude,
    accuracy: location.coords.accuracy || undefined,
  };
};

let watchSubscription: Location.LocationSubscription | null = null;

export const watchPosition = (
  callback: (location: LocationType) => void,
): number => {
  Location.requestForegroundPermissionsAsync().then(async ({status}) => {
    if (status === 'granted') {
      watchSubscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          distanceInterval: 10, // Update every 10 meters
        },
        location => {
          callback({
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            accuracy: location.coords.accuracy || undefined,
          });
        },
      );
    }
  });

  return watchSubscription ? 1 : 0; // Return a number for compatibility
};

export const determineBiome = (location: Location): string => {
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
  location: Location,
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

