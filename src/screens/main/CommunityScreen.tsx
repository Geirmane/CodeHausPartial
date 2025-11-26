import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import {useAuth} from '../../context/AuthContext';
import {useTheme} from '../../context/ThemeContext';
import {useNavigation} from '@react-navigation/native';
import {SharedDiscovery} from '../../types';
import {
  getCommunityFeed,
  shareDiscovery,
  likeDiscovery,
} from '../../services/communityService';

const CommunityScreen: React.FC = () => {
  const {user} = useAuth();
  const {colors} = useTheme();
  const navigation = useNavigation();
  const [feed, setFeed] = useState<SharedDiscovery[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadFeed();
  }, []);

  const loadFeed = async () => {
    try {
      setLoading(true);
      const feedData = await getCommunityFeed();
      setFeed(feedData);
    } catch (error) {
      console.error('Error loading feed:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadFeed();
  };

  const handleLike = async (discoveryId: string) => {
    if (!user) return;
    try {
      await likeDiscovery(discoveryId, user.uid);
      loadFeed(); // Refresh to get updated likes
    } catch (error) {
      console.error('Error liking discovery:', error);
    }
  };

  const renderDiscoveryItem = ({item}: {item: SharedDiscovery}) => (
    <View style={[styles.discoveryCard, {backgroundColor: colors.surface}]}>
      <View style={styles.discoveryHeader}>
        {item.userPhoto ? (
          <Image source={{uri: item.userPhoto}} style={styles.userAvatar} />
        ) : (
          <View style={[styles.userAvatarPlaceholder, {backgroundColor: colors.primary}]}>
            <Text style={styles.userAvatarText}>
              {item.userName.charAt(0).toUpperCase()}
            </Text>
          </View>
        )}
        <View style={styles.userInfo}>
          <Text style={[styles.userName, {color: colors.text}]}>{item.userName}</Text>
          <Text style={[styles.timestamp, {color: colors.textSecondary}]}>
            {formatTimestamp(item.timestamp)}
          </Text>
        </View>
      </View>

      <View style={styles.pokemonInfo}>
        <Image
          source={{uri: item.pokemonImage}}
          style={styles.pokemonImage}
          resizeMode="contain"
        />
        <View style={styles.pokemonDetails}>
          <Text style={[styles.pokemonName, {color: colors.text}]}>
            {item.pokemonName.charAt(0).toUpperCase() + item.pokemonName.slice(1)}
          </Text>
          {item.message && (
            <Text style={[styles.message, {color: colors.textSecondary}]}>
              {item.message}
            </Text>
          )}
          {item.location && (
            <Text style={[styles.location, {color: colors.textSecondary}]}>
              📍 Discovered nearby
            </Text>
          )}
        </View>
      </View>

      {item.photo && (
        <Image source={{uri: item.photo}} style={styles.capturedPhoto} resizeMode="cover" />
      )}

      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.likeButton}
          onPress={() => handleLike(item.id)}
          disabled={!user}>
          <Text style={[styles.likeIcon, {color: colors.primary}]}>❤️</Text>
          <Text style={[styles.likeCount, {color: colors.textSecondary}]}>
            {item.likes}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading && feed.length === 0) {
    return (
      <View style={[styles.container, styles.loadingContainer, {backgroundColor: colors.background}]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, {color: colors.textSecondary}]}>
          Loading community feed...
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, {backgroundColor: colors.background}]}>
      <FlatList
        data={feed}
        renderItem={renderDiscoveryItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={[styles.emptyText, {color: colors.textSecondary}]}>
              No discoveries yet. Be the first to share!
            </Text>
          </View>
        }
      />
    </View>
  );
};

const formatTimestamp = (timestamp: Date): string => {
  const now = new Date();
  const diff = now.getTime() - timestamp.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return timestamp.toLocaleDateString();
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
  listContent: {
    padding: 16,
  },
  discoveryCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  discoveryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  userAvatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  userAvatarText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  timestamp: {
    fontSize: 12,
  },
  pokemonInfo: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  pokemonImage: {
    width: 80,
    height: 80,
    marginRight: 12,
  },
  pokemonDetails: {
    flex: 1,
    justifyContent: 'center',
  },
  pokemonName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
    textTransform: 'capitalize',
  },
  message: {
    fontSize: 14,
    marginBottom: 4,
  },
  location: {
    fontSize: 12,
  },
  capturedPhoto: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 12,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  likeButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  likeIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  likeCount: {
    fontSize: 14,
    fontWeight: '600',
  },
  emptyContainer: {
    padding: 32,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
  },
});

export default CommunityScreen;


