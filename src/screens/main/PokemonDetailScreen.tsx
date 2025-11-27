import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import {useRoute, useNavigation} from '@react-navigation/native';
import {usePokemon} from '../../context/PokemonContext';
import {useAuth} from '../../context/AuthContext';
import {useTheme} from '../../context/ThemeContext';
import {Pokemon} from '../../types';
import {addDiscoveredPokemon} from '../../services/userService';
import {shareDiscovery} from '../../services/communityService';
import {checkAndAwardBadges} from '../../services/gamificationService';
import Share from 'react-native-share';

const PokemonDetailScreen: React.FC = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const {pokemon: routePokemon} = (route.params as {pokemon: Pokemon}) || {};
  const [pokemon, setPokemon] = useState<Pokemon | null>(routePokemon || null);
  const {getPokemon} = usePokemon();
  const {user, updateUser} = useAuth();
  const {colors} = useTheme();
  const [loading, setLoading] = useState(!routePokemon);

  useEffect(() => {
    if (!routePokemon && route.params) {
      const pokemonId = (route.params as {pokemonId: number}).pokemonId;
      if (pokemonId) {
        loadPokemon(pokemonId);
      }
    }
  }, []);

  const loadPokemon = async (id: number) => {
    setLoading(true);
    const data = await getPokemon(id);
    setPokemon(data);
    setLoading(false);
  };

  const handleDiscover = async () => {
    if (!pokemon || !user) return;

    try {
      await addDiscoveredPokemon(user.uid, pokemon.id);
      await updateUser({});
      
      // Check for new badges
      const newBadges = await checkAndAwardBadges(user.uid);
      if (newBadges.length > 0) {
        Alert.alert('Badge Earned!', `You earned ${newBadges.length} new badge(s)!`);
      }
    } catch (error) {
      console.error('Error adding discovered Pokemon:', error);
    }
  };

  const handleShare = async () => {
    if (!pokemon || !user) return;

    try {
      if (pokemon.sprites.front_default) {
        await Share.open({
          url: pokemon.sprites.front_default,
          message: `I discovered ${pokemon.name}! #PokeExplorer`,
          failOnCancel: false,
        });
      } else {
        Alert.alert('Share', `I discovered ${pokemon.name}! #PokeExplorer`);
      }
      
      // Also share to community feed
      await shareDiscovery(
        user.uid,
        pokemon.id,
        pokemon.name,
        pokemon.sprites.front_default,
        undefined,
        undefined,
        `Just discovered ${pokemon.name}!`,
      );
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  if (loading || !pokemon) {
    return (
      <View style={[styles.container, styles.loadingContainer, {backgroundColor: colors.background}]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView style={[styles.container, {backgroundColor: colors.background}]}>
      <View style={[styles.header, {backgroundColor: colors.surface}]}>
        <Image
          source={{uri: pokemon.sprites.front_default}}
          style={styles.mainImage}
          resizeMode="contain"
        />
        <Text style={[styles.name, {color: colors.text}]}>
          #{pokemon.id} {pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1)}
        </Text>
        <View style={styles.typesContainer}>
          {pokemon.types.map(type => (
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
      </View>

      <View style={[styles.section, {backgroundColor: colors.surface}]}>
        <Text style={[styles.sectionTitle, {color: colors.text}]}>Stats</Text>
        {pokemon.stats.map(stat => (
          <View key={stat.stat.name} style={styles.statRow}>
            <Text style={[styles.statLabel, {color: colors.textSecondary}]}>
              {stat.stat.name.replace('-', ' ')}
            </Text>
            <View style={[styles.statBarContainer, {backgroundColor: colors.border}]}>
              <View
                style={[
                  styles.statBar,
                  {
                    width: `${(stat.base_stat / 255) * 100}%`,
                    backgroundColor: colors.primary,
                  },
                ]}
              />
            </View>
            <Text style={[styles.statValue, {color: colors.text}]}>{stat.base_stat}</Text>
          </View>
        ))}
      </View>

      <View style={[styles.section, {backgroundColor: colors.surface}]}>
        <Text style={[styles.sectionTitle, {color: colors.text}]}>Abilities</Text>
        {pokemon.abilities.map(ability => (
          <View key={ability.ability.name} style={styles.abilityItem}>
            <Text style={[styles.abilityName, {color: colors.text}]}>
              {ability.ability.name.replace('-', ' ')}
            </Text>
            {ability.is_hidden && (
              <Text style={[styles.hiddenLabel, {color: colors.textSecondary}]}>(Hidden)</Text>
            )}
          </View>
        ))}
      </View>

      {pokemon.flavorText && (
        <View style={[styles.section, {backgroundColor: colors.surface}]}>
          <Text style={[styles.sectionTitle, {color: colors.text}]}>Description</Text>
          <Text style={[styles.description, {color: colors.textSecondary}]}>
            {pokemon.flavorText}
          </Text>
        </View>
      )}

      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={[styles.button, {backgroundColor: colors.primary}]}
          onPress={handleDiscover}>
          <Text style={styles.buttonText}>Mark as Discovered</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, styles.shareButton, {borderColor: colors.primary}]}
          onPress={handleShare}>
          <Text style={[styles.shareButtonText, {color: colors.primary}]}>Share</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
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
  header: {
    alignItems: 'center',
    padding: 24,
    marginBottom: 16,
  },
  mainImage: {
    width: 200,
    height: 200,
    marginBottom: 16,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  typesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  typeBadge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    margin: 4,
  },
  typeText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  section: {
    padding: 16,
    marginBottom: 16,
    borderRadius: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
  },
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  statLabel: {
    width: 100,
    fontSize: 14,
    textTransform: 'capitalize',
  },
  statBarContainer: {
    flex: 1,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 12,
    overflow: 'hidden',
  },
  statBar: {
    height: '100%',
    borderRadius: 4,
  },
  statValue: {
    width: 40,
    textAlign: 'right',
    fontSize: 14,
    fontWeight: '600',
  },
  abilityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  abilityName: {
    fontSize: 16,
    textTransform: 'capitalize',
  },
  hiddenLabel: {
    fontSize: 12,
    marginLeft: 8,
    fontStyle: 'italic',
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
  },
  actionButtons: {
    padding: 16,
    gap: 12,
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
  shareButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
  },
  shareButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});

export default PokemonDetailScreen;

