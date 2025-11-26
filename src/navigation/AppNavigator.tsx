import React from 'react';
import {createStackNavigator} from '@react-navigation/stack';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {useAuth} from '../context/AuthContext';
import {useTheme} from '../context/ThemeContext';

// Auth Screens
import LoginScreen from '../screens/auth/LoginScreen';
import SignUpScreen from '../screens/auth/SignUpScreen';

// Main Screens
import PokedexScreen from '../screens/main/PokedexScreen';
import PokemonDetailScreen from '../screens/main/PokemonDetailScreen';
import HuntScreen from '../screens/main/HuntScreen';
import ARScreen from '../screens/main/ARScreen';
import ProfileScreen from '../screens/main/ProfileScreen';
import CommunityScreen from '../screens/main/CommunityScreen';
import GalleryScreen from '../screens/main/GalleryScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const MainTabs = () => {
  const {colors} = useTheme();

  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        headerStyle: {
          backgroundColor: colors.primary,
        },
        headerTintColor: '#fff',
        tabBarStyle: {
          backgroundColor: colors.surface,
        },
      }}>
      <Tab.Screen
        name="Pokedex"
        component={PokedexScreen}
        options={{
          tabBarLabel: 'Pokedex',
          headerTitle: 'Pokedex',
        }}
      />
      <Tab.Screen
        name="Hunt"
        component={HuntScreen}
        options={{
          tabBarLabel: 'Hunt',
          headerTitle: 'Pokemon Hunt',
        }}
      />
      <Tab.Screen
        name="AR"
        component={ARScreen}
        options={{
          tabBarLabel: 'AR',
          headerTitle: 'AR Explorer',
        }}
      />
      <Tab.Screen
        name="Community"
        component={CommunityScreen}
        options={{
          tabBarLabel: 'Community',
          headerTitle: 'Community Feed',
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Profile',
          headerTitle: 'My Profile',
        }}
      />
    </Tab.Navigator>
  );
};

const AppNavigator = () => {
  const {user, loading} = useAuth();

  if (loading) {
    // You can add a loading screen here
    return null;
  }

  return (
    <Stack.Navigator screenOptions={{headerShown: false}}>
      {user ? (
        <>
          <Stack.Screen name="MainTabs" component={MainTabs} />
          <Stack.Screen
            name="PokemonDetail"
            component={PokemonDetailScreen}
            options={{
              headerShown: true,
              headerTitle: 'Pokemon Details',
            }}
          />
          <Stack.Screen
            name="Gallery"
            component={GalleryScreen}
            options={{
              headerShown: true,
              headerTitle: 'My Gallery',
            }}
          />
        </>
      ) : (
        <>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="SignUp" component={SignUpScreen} />
        </>
      )}
    </Stack.Navigator>
  );
};

export default AppNavigator;

