import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import {useAuth} from '../../context/AuthContext';
import {usePokemon} from '../../context/PokemonContext';
import {useTheme} from '../../context/ThemeContext';
import {useNavigation} from '@react-navigation/native';
import {Pokemon} from '../../types';
import {getUserData} from '../../services/userService';
import {getDailyChallenges, BADGES} from '../../services/gamificationService';

const ProfileScreen: React.FC = () => {
  const {user, signOut} = useAuth();
  const {getPokemon} = usePokemon();
  const {colors} = useTheme();
  const navigation = useNavigation();
  const [discoveredPokemon, setDiscoveredPokemon] = useState<Pokemon[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDiscoveredPokemon();
  }, [user]);

  const loadDiscoveredPokemon = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const userData = await getUserData(user.uid);
      const pokemonPromises = userData.discoveredPokemon.map(id => getPokemon(id));
      const pokemonResults = await Promise.all(pokemonPromises);
      setDiscoveredPokemon(pokemonResults.filter(p => p !== null) as Pokemon[]);
    } catch (error) {
      console.error('Error loading discovered Pokemon:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
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
    </TouchableOpacity>
  );

  if (!user) {
    return null;
  }

  return (
    <ScrollView style={[styles.container, {backgroundColor: colors.background}]}>
      {/* Profile Header */}
      <View style={[styles.header, {backgroundColor: colors.primary}]}>
        <View style={styles.profileInfo}>
          {user.photoURL ? (
            <Image source={{uri: user.photoURL}} style={styles.avatar} />
          ) : (
            <View style={[styles.avatarPlaceholder, {backgroundColor: colors.surface}]}>
              <Text style={[styles.avatarText, {color: colors.primary}]}>
                {user.displayName?.charAt(0).toUpperCase() || user.email.charAt(0).toUpperCase()}
              </Text>
            </View>
          )}
          <View style={styles.userInfo}>
            <Text style={styles.displayName}>{user.displayName || 'Trainer'}</Text>
            <Text style={styles.email}>{user.email}</Text>
          </View>
        </View>

        {/* Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{user.discoveredPokemon.length}</Text>
            <Text style={styles.statLabel}>Discovered</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{user.points}</Text>
            <Text style={styles.statLabel}>Points</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{user.badges.length}</Text>
            <Text style={styles.statLabel}>Badges</Text>
          </View>
        </View>
      </View>

      {/* Badges Section */}
      {user.badges.length > 0 && (
        <View style={[styles.section, {backgroundColor: colors.surface}]}>
          <Text style={[styles.sectionTitle, {color: colors.text}]}>Badges</Text>
          <View style={styles.badgesContainer}>
            {user.badges.map(badgeId => {
              const badge = BADGES.find(b => b.id === badgeId);
              return badge ? (
                <View key={badgeId} style={[styles.badge, {backgroundColor: colors.accent}]}>
                  <Text style={styles.badgeText}>{badge.icon}</Text>
                  <Text style={[styles.badgeLabel, {color: colors.text}]}>{badge.name}</Text>
                </View>
              ) : null;
            })}
          </View>
        </View>
      )}

      {/* Daily Challenges */}
      <View style={[styles.section, {backgroundColor: colors.surface}]}>
        <Text style={[styles.sectionTitle, {color: colors.text}]}>Daily Challenges</Text>
        {getDailyChallenges().map(challenge => (
          <View key={challenge.id} style={styles.challengeItem}>
            <View style={styles.challengeInfo}>
              <Text style={[styles.challengeTitle, {color: colors.text}]}>
                {challenge.title}
              </Text>
              <Text style={[styles.challengeDescription, {color: colors.textSecondary}]}>
                {challenge.description}
              </Text>
            </View>
            <View style={styles.challengeReward}>
              <Text style={[styles.rewardText, {color: colors.primary}]}>
                +{challenge.reward.points} pts
              </Text>
            </View>
          </View>
        ))}
      </View>

      {/* Discovered Pokemon */}
      <View style={[styles.section, {backgroundColor: colors.surface}]}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, {color: colors.text}]}>
            My Pokedex ({discoveredPokemon.length})
          </Text>
          <TouchableOpacity
            onPress={() => navigation.navigate('Gallery' as never)}
            style={styles.galleryButton}>
            <Text style={[styles.galleryButtonText, {color: colors.primary}]}>Gallery</Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : discoveredPokemon.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={[styles.emptyText, {color: colors.textSecondary}]}>
              No Pokemon discovered yet. Start exploring!
            </Text>
          </View>
        ) : (
          <FlatList
            data={discoveredPokemon}
            renderItem={renderPokemonItem}
            keyExtractor={item => item.id.toString()}
            numColumns={2}
            scrollEnabled={false}
            contentContainerStyle={styles.pokemonList}
          />
        )}
      </View>

      {/* Sign Out Button */}
      <TouchableOpacity
        style={[styles.signOutButton, {backgroundColor: colors.error}]}
        onPress={handleSignOut}>
        <Text style={styles.signOutButtonText}>Sign Out</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 24,
    paddingTop: 48,
  },
  profileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: 16,
  },
  avatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  userInfo: {
    flex: 1,
  },
  displayName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  email: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.2)',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    textTransform: 'uppercase',
  },
  section: {
    padding: 16,
    marginTop: 16,
    borderRadius: 8,
    marginHorizontal: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
  },
  badgesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  badge: {
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    minWidth: 80,
  },
  badgeText: {
    fontSize: 24,
    marginBottom: 4,
  },
  badgeLabel: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  challengeItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    marginBottom: 8,
    borderRadius: 8,
    backgroundColor: '#F5F5F5',
  },
  challengeInfo: {
    flex: 1,
  },
  challengeTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  challengeDescription: {
    fontSize: 14,
  },
  challengeReward: {
    marginLeft: 12,
  },
  rewardText: {
    fontSize: 14,
    fontWeight: '600',
  },
  pokemonList: {
    gap: 8,
  },
  pokemonCard: {
    flex: 1,
    margin: 4,
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  pokemonImage: {
    width: 80,
    height: 80,
    marginBottom: 8,
  },
  pokemonName: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
    textTransform: 'capitalize',
  },
  loadingContainer: {
    padding: 32,
    alignItems: 'center',
  },
  emptyContainer: {
    padding: 32,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
  },
  galleryButton: {
    padding: 8,
  },
  galleryButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  signOutButton: {
    margin: 16,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  signOutButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ProfileScreen;

