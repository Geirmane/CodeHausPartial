export const POKEAPI_BASE_URL = 'https://pokeapi.co/api/v2';
export const POKEMON_LIMIT = 200; // Limit to 100-200 Pokemon for initial load

export const BIOMES = {
  URBAN: 'urban',
  RURAL: 'rural',
  WATER: 'water',
  FOREST: 'forest',
  MOUNTAIN: 'mountain',
  DESERT: 'desert',
};

export const BIOME_POKEMON_TYPES: Record<string, string[]> = {
  [BIOMES.URBAN]: ['normal', 'electric', 'steel', 'poison'],
  [BIOMES.RURAL]: ['normal', 'grass', 'bug', 'flying'],
  [BIOMES.WATER]: ['water', 'ice', 'flying'],
  [BIOMES.FOREST]: ['grass', 'bug', 'flying', 'normal'],
  [BIOMES.MOUNTAIN]: ['rock', 'ground', 'fighting'],
  [BIOMES.DESERT]: ['ground', 'rock', 'fire'],
};

export const NOTIFICATION_CONFIG = {
  CHANNEL_ID: 'pokemon_discoveries',
  CHANNEL_NAME: 'Pokemon Discoveries',
};

export const CACHE_CONFIG = {
  POKEMON_CACHE_KEY: 'pokemon_cache',
  USER_DATA_KEY: 'user_data',
  CACHE_EXPIRY: 24 * 60 * 60 * 1000, // 24 hours
};

