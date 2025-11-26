import {ref, set, get} from 'firebase/database';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {User} from '../types';
import {CACHE_CONFIG} from '../constants/config';
import {database} from '../config/firebase';

export const saveUserData = async (user: User): Promise<void> => {
  try {
    // Save to Firebase
    await set(ref(database, `users/${user.uid}`), {
      ...user,
      createdAt: user.createdAt.toISOString(),
    });

    // Cache locally
    await AsyncStorage.setItem(
      `${CACHE_CONFIG.USER_DATA_KEY}_${user.uid}`,
      JSON.stringify(user),
    );
  } catch (error) {
    console.error('Error saving user data:', error);
    throw error;
  }
};

export const getUserData = async (uid: string): Promise<User> => {
  try {
    // Try cache first
    const cached = await AsyncStorage.getItem(`${CACHE_CONFIG.USER_DATA_KEY}_${uid}`);
    if (cached) {
      const userData = JSON.parse(cached);
      userData.createdAt = new Date(userData.createdAt);
      return userData;
    }

    // Fetch from Firebase
    const snapshot = await get(ref(database, `users/${uid}`));
    const data = snapshot.val();

    if (!data) {
      throw new Error('User data not found');
    }

    const user: User = {
      ...data,
      createdAt: new Date(data.createdAt),
    };

    // Cache it
    await AsyncStorage.setItem(
      `${CACHE_CONFIG.USER_DATA_KEY}_${uid}`,
      JSON.stringify(user),
    );

    return user;
  } catch (error) {
    console.error('Error fetching user data:', error);
    throw error;
  }
};

export const addDiscoveredPokemon = async (uid: string, pokemonId: number): Promise<void> => {
  try {
    const user = await getUserData(uid);
    if (!user.discoveredPokemon.includes(pokemonId)) {
      user.discoveredPokemon.push(pokemonId);
      user.points += 10; // Award points for discovery
      await saveUserData(user);
    }
  } catch (error) {
    console.error('Error adding discovered Pokemon:', error);
    throw error;
  }
};

