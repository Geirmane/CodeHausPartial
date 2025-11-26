import axios from 'axios';
import {POKEAPI_BASE_URL, POKEMON_LIMIT} from '../constants/config';
import {Pokemon} from '../types';

const api = axios.create({
  baseURL: POKEAPI_BASE_URL,
  timeout: 10000,
});

export const fetchPokemon = async (id: number): Promise<Pokemon | null> => {
  try {
    const response = await api.get(`/pokemon/${id}`);
    const data = response.data;

    // Fetch species data for flavor text
    let flavorText = '';
    try {
      const speciesResponse = await api.get(data.species.url);
      const flavorTextEntries = speciesResponse.data.flavor_text_entries;
      const englishEntry = flavorTextEntries.find(
        (entry: any) => entry.language.name === 'en',
      );
      if (englishEntry) {
        flavorText = englishEntry.flavor_text;
      }
    } catch (err) {
      console.warn('Could not fetch flavor text:', err);
    }

    const pokemon: Pokemon = {
      id: data.id,
      name: data.name,
      types: data.types,
      abilities: data.abilities,
      stats: data.stats,
      sprites: data.sprites,
      height: data.height,
      weight: data.weight,
      base_experience: data.base_experience,
      species: data.species,
      flavorText,
    };

    return pokemon;
  } catch (error) {
    console.error('Error fetching Pokemon:', error);
    throw error;
  }
};

export const fetchPokemonList = async (limit: number = POKEMON_LIMIT): Promise<number[]> => {
  try {
    const response = await api.get(`/pokemon?limit=${limit}`);
    return response.data.results.map((pokemon: any, index: number) => index + 1);
  } catch (error) {
    console.error('Error fetching Pokemon list:', error);
    throw error;
  }
};

export const searchPokemon = async (query: string): Promise<Pokemon[]> => {
  try {
    // Try to fetch by ID first
    const id = parseInt(query, 10);
    if (!isNaN(id) && id > 0 && id <= POKEMON_LIMIT) {
      const pokemon = await fetchPokemon(id);
      return pokemon ? [pokemon] : [];
    }

    // Search by name
    try {
      const response = await api.get(`/pokemon/${query.toLowerCase()}`);
      const pokemon = await fetchPokemon(response.data.id);
      return pokemon ? [pokemon] : [];
    } catch (err) {
      // If not found, return empty array
      return [];
    }
  } catch (error) {
    console.error('Error searching Pokemon:', error);
    return [];
  }
};

export const fetchEvolutionChain = async (speciesUrl: string): Promise<any> => {
  try {
    const speciesResponse = await api.get(speciesUrl);
    const evolutionChainUrl = speciesResponse.data.evolution_chain.url;
    const evolutionResponse = await api.get(evolutionChainUrl);
    return evolutionResponse.data;
  } catch (error) {
    console.error('Error fetching evolution chain:', error);
    return null;
  }
};

