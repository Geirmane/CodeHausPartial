// Pokemon Types
export interface Pokemon {
  id: number;
  name: string;
  types: PokemonType[];
  abilities: Ability[];
  stats: Stat[];
  sprites: Sprites;
  height: number;
  weight: number;
  base_experience: number;
  species: {
    name: string;
    url: string;
  };
  flavorText?: string;
  evolutionChain?: EvolutionChain;
}

export interface PokemonType {
  slot: number;
  type: {
    name: string;
    url: string;
  };
}

export interface Ability {
  ability: {
    name: string;
    url: string;
  };
  is_hidden: boolean;
  slot: number;
}

export interface Stat {
  base_stat: number;
  effort: number;
  stat: {
    name: string;
    url: string;
  };
}

export interface Sprites {
  front_default: string;
  front_shiny: string;
  back_default: string;
  back_shiny: string;
  other?: {
    'official-artwork': {
      front_default: string;
    };
  };
}

export interface EvolutionChain {
  chain: EvolutionLink;
}

export interface EvolutionLink {
  species: {
    name: string;
    url: string;
  };
  evolves_to: EvolutionLink[];
  evolution_details?: EvolutionDetail[];
}

export interface EvolutionDetail {
  min_level: number;
  trigger: {
    name: string;
  };
}

// User Types
export interface User {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  discoveredPokemon: number[];
  badges: string[];
  points: number;
  createdAt: Date;
}

// Location Types
export interface Location {
  latitude: number;
  longitude: number;
  accuracy?: number;
}

export interface PokemonEncounter {
  pokemonId: number;
  location: Location;
  timestamp: Date;
  biome: string;
}

// AR/VR Types
export interface ARPokemon {
  pokemonId: number;
  position: {
    x: number;
    y: number;
    z: number;
  };
  rotation: {
    x: number;
    y: number;
    z: number;
  };
}

// Sharing Types
export interface SharedDiscovery {
  id: string;
  userId: string;
  userName: string;
  userPhoto?: string;
  pokemonId: number;
  pokemonName: string;
  pokemonImage: string;
  location?: Location;
  photo?: string;
  message?: string;
  timestamp: Date;
  likes: number;
}

// Gamification Types
export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  requirement: string;
}

export interface Challenge {
  id: string;
  title: string;
  description: string;
  type: 'daily' | 'weekly' | 'special';
  requirement: {
    type: string;
    count: number;
  };
  reward: {
    points: number;
    badge?: string;
  };
  completed: boolean;
}

