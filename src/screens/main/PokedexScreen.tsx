import React, {useState, useEffect, useCallback} from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  Alert,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import Voice, {
  SpeechErrorEvent,
  SpeechResultsEvent,
} from '@react-native-voice/voice';
import {usePokemon} from '../../context/PokemonContext';
import {useTheme} from '../../context/ThemeContext';
import {Pokemon} from '../../types';
import {fetchPokemonList} from '../../services/pokeApiService';
import {POKEMON_LIMIT} from '../../constants/config';
import {requestMicrophonePermission} from '../../utils/permissions';

const PokedexScreen: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [pokemonIds, setPokemonIds] = useState<number[]>([]);
  const [displayedPokemon, setDisplayedPokemon] = useState<Pokemon[]>([]);
  const [loading, setLoading] = useState(true);
  const [isListening, setIsListening] = useState(false);
  const {getPokemon, searchPokemonByName} = usePokemon();
  const {colors} = useTheme();
  const navigation = useNavigation();

  useEffect(() => {
    loadPokemonList();
  }, []);

  useEffect(() => {
    Voice.onSpeechResults = handleSpeechResults;
    Voice.onSpeechError = handleSpeechError;

    return () => {
      Voice.destroy().finally(() => Voice.removeAllListeners());
    };
  }, [handleSpeechResults, handleSpeechError]);

  useEffect(() => {
    if (searchQuery.trim()) {
      handleSearch(searchQuery);
    } else {
      loadPokemonList();
    }
  }, [searchQuery]);

  const loadPokemonList = async () => {
    try {
      setLoading(true);
      const ids = await fetchPokemonList(POKEMON_LIMIT);
      setPokemonIds(ids);
      
      // Load first 20 Pokemon for display
      const initialPokemon = await Promise.all(
        ids.slice(0, 20).map(id => getPokemon(id)),
      );
      setDisplayedPokemon(initialPokemon.filter(p => p !== null) as Pokemon[]);
    } catch (error) {
      console.error('Error loading Pokemon list:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (query: string) => {
    if (!query.trim()) {
      loadPokemonList();
      return;
    }

    setLoading(true);
    try {
      const results = await searchPokemonByName(query);
      setDisplayedPokemon(results);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSpeechResults = useCallback(
    (event: SpeechResultsEvent) => {
      const text = event.value?.[0];
      if (text) {
        setSearchQuery(text.toLowerCase());
      }
      setIsListening(false);
    },
    [setSearchQuery],
  );

  const handleSpeechError = useCallback((event: SpeechErrorEvent) => {
    console.warn('Voice error:', event.error);
    setIsListening(false);
  }, []);

  const startVoiceSearch = async () => {
    try {
      const hasPermission = await requestMicrophonePermission();
      if (!hasPermission) {
        Alert.alert('Permission Required', 'Microphone permission is needed for voice search.');
        return;
      }
      setIsListening(true);
      await Voice.start('en-US');
    } catch (error) {
      console.error('Voice start error:', error);
      setIsListening(false);
    }
  };

  const stopVoiceSearch = async () => {
    try {
      await Voice.stop();
    } catch (error) {
      console.error('Voice stop error:', error);
    } finally {
      setIsListening(false);
    }
  };

  const renderPokemonItem = ({item}: {item: Pokemon}) => (
    <TouchableOpacity
      style={[styles.pokemonCard, {backgroundColor: colors.surface}]}
      onPress={() => navigation.navigate('PokemonDetail' as never, {pokemon: item} as never)}>
      <Image
        source={{uri: item.sprites.front_default}}
        style={styles.pokemonImage}
        resizeMode="contain"
      />
      <Text style={[styles.pokemonName, {color: colors.text}]}>
        #{item.id} {item.name.charAt(0).toUpperCase() + item.name.slice(1)}
      </Text>
      <View style={styles.typesContainer}>
        {item.types.map(type => (
          <View
            key={type.slot}
            style={[
              styles.typeBadge,
              {backgroundColor: colors[type.type.name as keyof typeof colors] || colors.primary},
            ]}>
            <Text style={styles.typeText}>{type.type.name}</Text>
          </View>
        ))}
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, {backgroundColor: colors.background}]}>
      <View style={[styles.searchContainer, {backgroundColor: colors.surface}]}>
        <View style={styles.searchInputContainer}>
          <TextInput
            style={[styles.searchInput, {color: colors.text}]}
            placeholder="Search by name or ID..."
            placeholderTextColor={colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          <TouchableOpacity
            style={[styles.voiceButton, {backgroundColor: colors.primary}]}
            onPress={isListening ? stopVoiceSearch : startVoiceSearch}>
            <Text style={styles.voiceButtonText}>{isListening ? '■' : '🎤'}</Text>
          </TouchableOpacity>
        </View>
      </View>

      {loading && displayedPokemon.length === 0 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={displayedPokemon}
          renderItem={renderPokemonItem}
          keyExtractor={item => item.id.toString()}
          numColumns={2}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={[styles.emptyText, {color: colors.textSecondary}]}>
                No Pokemon found
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchContainer: {
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  searchInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  voiceButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  voiceButtonText: {
    fontSize: 20,
  },
  listContent: {
    padding: 8,
  },
  pokemonCard: {
    flex: 1,
    margin: 8,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  pokemonImage: {
    width: 100,
    height: 100,
    marginBottom: 8,
  },
  pokemonName: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },
  typesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  typeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    margin: 2,
  },
  typeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 16,
  },
});

export default PokedexScreen;

