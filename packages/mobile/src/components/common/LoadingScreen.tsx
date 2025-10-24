import React from 'react';
import {
  View,
  ActivityIndicator,
  StyleSheet,
  Text,
  StatusBar,
} from 'react-native';
import {useTheme} from '../../contexts/ThemeContext';

interface LoadingScreenProps {
  message?: string;
  size?: 'small' | 'large';
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({
  message = 'Yükleniyor...',
  size = 'large',
}) => {
  const {theme, isDarkMode} = useTheme();

  return (
    <>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={theme.colors.background}
      />
      <View style={[styles.container, {backgroundColor: theme.colors.background}]}>
        <ActivityIndicator 
          size={size} 
          color={theme.colors.primary}
          style={styles.indicator}
        />
        {message && (
          <Text style={[
            styles.message,
            {
              color: theme.colors.onBackground,
              fontFamily: theme.typography.fontFamily.medium,
              fontSize: theme.typography.body1.fontSize,
            }
          ]}>
            {message}
          </Text>
        )}
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  indicator: {
    marginBottom: 16,
  },
  message: {
    textAlign: 'center',
    marginTop: 8,
  },
});

export default LoadingScreen;