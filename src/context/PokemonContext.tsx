import React, {createContext, useContext, useState, ReactNode} from 'react';
import {Pokemon} from '../types';
import {fetchPokemon, searchPokemon} from '../services/pokeApiService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {CACHE_CONFIG} from '../constants/config';

interface PokemonContextType {
  pokemonList: Pokemon[];
  loading: boolean;
  error: string | null;
  getPokemon: (id: number) => Promise<Pokemon | null>;
  searchPokemonByName: (query: string) => Promise<Pokemon[]>;
  searchPokemonByType: (type: string) => Promise<Pokemon[]>;
  cachePokemon: (pokemon: Pokemon) => Promise<void>;
  getCachedPokemon: (id: number) => Promise<Pokemon | null>;
}

const PokemonContext = createContext<PokemonContextType | undefined>(undefined);

export const PokemonProvider: React.FC<{children: ReactNode}> = ({children}) => {
  const [pokemonList, setPokemonList] = useState<Pokemon[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getPokemon = async (id: number): Promise<Pokemon | null> => {
    try {
      setLoading(true);
      setError(null);

      // Check cache first
      const cached = await getCachedPokemon(id);
      if (cached) {
        setLoading(false);
        return cached;
      }

      const pokemon = await fetchPokemon(id);
      if (pokemon) {
        await cachePokemon(pokemon);
      }
      setLoading(false);
      return pokemon;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch Pokemon');
      setLoading(false);
      return null;
    }
  };

  const searchPokemonByName = async (query: string): Promise<Pokemon[]> => {
    try {
      setLoading(true);
      setError(null);
      const results = await searchPokemon(query);
      setLoading(false);
      return results;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Search failed');
      setLoading(false);
      return [];
    }
  };

  const searchPokemonByType = async (type: string): Promise<Pokemon[]> => {
    // Implementation for type-based search
    // This would require additional PokeAPI endpoints
    return [];
  };

  const cachePokemon = async (pokemon: Pokemon): Promise<void> => {
    try {
      const cacheKey = `${CACHE_CONFIG.POKEMON_CACHE_KEY}_${pokemon.id}`;
      const cacheData = {
        pokemon,
        timestamp: Date.now(),
      };
      await AsyncStorage.setItem(cacheKey, JSON.stringify(cacheData));
    } catch (err) {
      console.error('Error caching Pokemon:', err);
    }
  };

  const getCachedPokemon = async (id: number): Promise<Pokemon | null> => {
    try {
      const cacheKey = `${CACHE_CONFIG.POKEMON_CACHE_KEY}_${id}`;
      const cached = await AsyncStorage.getItem(cacheKey);
      if (cached) {
        const cacheData = JSON.parse(cached);
        const now = Date.now();
        // Check if cache is still valid
        if (now - cacheData.timestamp < CACHE_CONFIG.CACHE_EXPIRY) {
          return cacheData.pokemon;
        }
      }
      return null;
    } catch (err) {
      console.error('Error reading cache:', err);
      return null;
    }
  };

  return (
    <PokemonContext.Provider
      value={{
        pokemonList,
        loading,
        error,
        getPokemon,
        searchPokemonByName,
        searchPokemonByType,
        cachePokemon,
        getCachedPokemon,
      }}>
      {children}
    </PokemonContext.Provider>
  );
};

export const usePokemon = () => {
  const context = useContext(PokemonContext);
  if (!context) {
    throw new Error('usePokemon must be used within PokemonProvider');
  }
  return context;
};

