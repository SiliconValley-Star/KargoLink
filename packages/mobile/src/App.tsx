import React from 'react';
import {StatusBar} from 'react-native';

// Providers
import {AuthProvider} from './contexts/AuthContext';
import {ThemeProvider} from './contexts/ThemeContext';

// Navigation
import AppNavigator from './navigation/AppNavigator';

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <StatusBar translucent backgroundColor="transparent" />
        <AppNavigator />
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;