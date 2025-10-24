import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {useTheme} from '../../contexts/ThemeContext';

const ForgotPasswordScreen: React.FC = () => {
  const {theme} = useTheme();

  return (
    <View style={[styles.container, {backgroundColor: theme.colors.background}]}>
      <Text style={[styles.title, {color: theme.colors.onBackground}]}>
        Şifremi Unuttum
      </Text>
      <Text style={[styles.subtitle, {color: theme.colors.onSurfaceVariant}]}>
        Bu ekran Task 9'da detaylandırılacak
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
  },
});

export default ForgotPasswordScreen;