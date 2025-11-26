import React, {useEffect} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {StatusBar} from 'expo-status-bar';
import {Platform} from 'react-native';
import {AuthProvider} from './src/context/AuthContext';
import {PokemonProvider} from './src/context/PokemonContext';
import AppNavigator from './src/navigation/AppNavigator';
import {ThemeProvider} from './src/context/ThemeContext';
import {configureNotifications} from './src/utils/notifications';

const App: React.FC = () => {
  useEffect(() => {
    configureNotifications();
  }, []);

  return (
    <ThemeProvider>
      <AuthProvider>
        <PokemonProvider>
          <NavigationContainer>
            <StatusBar style={Platform.OS === 'ios' ? 'dark' : 'light'} />
            <AppNavigator />
          </NavigationContainer>
        </PokemonProvider>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;

