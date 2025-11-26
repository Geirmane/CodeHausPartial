import {User, Badge, Challenge} from '../types';
import {getUserData, saveUserData} from './userService';

export const BADGES: Badge[] = [
  {
    id: 'first_discovery',
    name: 'First Discovery',
    description: 'Discover your first Pokemon',
    icon: '🌟',
    requirement: 'Discover 1 Pokemon',
  },
  {
    id: 'explorer',
    name: 'Explorer',
    description: 'Discover 10 Pokemon',
    icon: '🗺️',
    requirement: 'Discover 10 Pokemon',
  },
  {
    id: 'master',
    name: 'Master Explorer',
    description: 'Discover 50 Pokemon',
    icon: '🏆',
    requirement: 'Discover 50 Pokemon',
  },
  {
    id: 'ar_enthusiast',
    name: 'AR Enthusiast',
    description: 'Capture 5 Pokemon in AR',
    icon: '📷',
    requirement: 'Capture 5 Pokemon in AR',
  },
  {
    id: 'social',
    name: 'Social Butterfly',
    description: 'Share 10 discoveries',
    icon: '💬',
    requirement: 'Share 10 discoveries',
  },
];

export const checkAndAwardBadges = async (userId: string): Promise<string[]> => {
  try {
    const user = await getUserData(userId);
    const newBadges: string[] = [];

    // Check each badge requirement
    for (const badge of BADGES) {
      if (user.badges.includes(badge.id)) continue; // Already has badge

      let shouldAward = false;

      switch (badge.id) {
        case 'first_discovery':
          shouldAward = user.discoveredPokemon.length >= 1;
          break;
        case 'explorer':
          shouldAward = user.discoveredPokemon.length >= 10;
          break;
        case 'master':
          shouldAward = user.discoveredPokemon.length >= 50;
          break;
        // Note: AR captures and shares would need to be tracked separately
        // For now, we'll use discovered Pokemon as a proxy
        case 'ar_enthusiast':
          shouldAward = user.discoveredPokemon.length >= 5;
          break;
        case 'social':
          // This would require tracking shares separately
          shouldAward = false;
          break;
      }

      if (shouldAward) {
        user.badges.push(badge.id);
        user.points += 50; // Award points for badge
        newBadges.push(badge.id);
      }
    }

    if (newBadges.length > 0) {
      await saveUserData(user);
    }

    return newBadges;
  } catch (error) {
    console.error('Error checking badges:', error);
    return [];
  }
};

export const getDailyChallenges = (): Challenge[] => {
  const today = new Date();
  const dayOfWeek = today.getDay();

  return [
    {
      id: 'daily_discover',
      title: 'Daily Discovery',
      description: 'Discover 3 Pokemon today',
      type: 'daily',
      requirement: {
        type: 'discover',
        count: 3,
      },
      reward: {
        points: 20,
      },
      completed: false,
    },
    {
      id: 'fire_type_hunt',
      title: 'Fire Type Hunter',
      description: 'Find a fire-type Pokemon today',
      type: 'daily',
      requirement: {
        type: 'fire',
        count: 1,
      },
      reward: {
        points: 30,
        badge: 'fire_hunter',
      },
      completed: false,
    },
    {
      id: 'water_type_hunt',
      title: 'Water Type Hunter',
      description: 'Find a water-type Pokemon today',
      type: 'daily',
      requirement: {
        type: 'water',
        count: 1,
      },
      reward: {
        points: 30,
        badge: 'water_hunter',
      },
      completed: false,
    },
  ];
};

export const checkChallengeProgress = async (
  userId: string,
  challengeId: string,
): Promise<boolean> => {
  try {
    const user = await getUserData(userId);
    const challenges = getDailyChallenges();
    const challenge = challenges.find(c => c.id === challengeId);

    if (!challenge) return false;

    // Check if challenge is completed
    // This is a simplified version - in a real app, you'd track daily progress
    return false; // Placeholder
  } catch (error) {
    console.error('Error checking challenge:', error);
    return false;
  }
};


