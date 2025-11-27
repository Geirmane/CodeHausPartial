import React, {useEffect} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {Platform, StatusBar} from 'react-native';
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
            <StatusBar
              barStyle={Platform.OS === 'ios' ? 'dark-content' : 'light-content'}
            />
            <AppNavigator />
          </NavigationContainer>
        </PokemonProvider>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;

