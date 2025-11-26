import {ref, push, set, get, query, orderByChild, limitToLast, onValue} from 'firebase/database';
import {database} from '../config/firebase';
import {SharedDiscovery} from '../types';
import {getUserData} from './userService';

export const shareDiscovery = async (
  userId: string,
  pokemonId: number,
  pokemonName: string,
  pokemonImage: string,
  location?: {latitude: number; longitude: number},
  photo?: string,
  message?: string,
): Promise<void> => {
  try {
    const user = await getUserData(userId);
    const discoveryRef = ref(database, 'discoveries');
    const newDiscoveryRef = push(discoveryRef);
    const discoveryId = newDiscoveryRef.key || '';

    const discovery: SharedDiscovery = {
      id: discoveryId,
      userId,
      userName: user.displayName || user.email,
      userPhoto: user.photoURL,
      pokemonId,
      pokemonName,
      pokemonImage,
      location,
      photo,
      message,
      timestamp: new Date(),
      likes: 0,
    };

    await set(newDiscoveryRef, {
      ...discovery,
      timestamp: discovery.timestamp.toISOString(),
      location: discovery.location
        ? {
            latitude: discovery.location.latitude,
            longitude: discovery.location.longitude,
          }
        : null,
    });
  } catch (error) {
    console.error('Error sharing discovery:', error);
    throw error;
  }
};

export const getCommunityFeed = async (limit: number = 50): Promise<SharedDiscovery[]> => {
  try {
    const discoveriesRef = ref(database, 'discoveries');
    const queryRef = query(discoveriesRef, orderByChild('timestamp'), limitToLast(limit));
    const snapshot = await get(queryRef);

    const discoveries: SharedDiscovery[] = [];
    if (snapshot.exists()) {
      snapshot.forEach(child => {
        const data = child.val();
        discoveries.push({
          ...data,
          timestamp: new Date(data.timestamp),
          location: data.location
            ? {
                latitude: data.location.latitude,
                longitude: data.location.longitude,
              }
            : undefined,
        });
      });
    }

    return discoveries.reverse(); // Most recent first
  } catch (error) {
    console.error('Error fetching community feed:', error);
    return [];
  }
};

export const likeDiscovery = async (discoveryId: string, userId: string): Promise<void> => {
  try {
    const discoveryRef = ref(database, `discoveries/${discoveryId}`);
    const snapshot = await get(discoveryRef);
    const discovery = snapshot.val();

    if (!discovery) {
      throw new Error('Discovery not found');
    }

    // Check if user already liked (in a real app, you'd track this)
    // For simplicity, we'll just increment likes
    await set(ref(database, `discoveries/${discoveryId}/likes`), (discovery.likes || 0) + 1);
  } catch (error) {
    console.error('Error liking discovery:', error);
    throw error;
  }
};

