import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const App: React.FC = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>🚛 CargoLink Mobile</Text>
      <Text style={styles.subtitle}>React Native Web Versiyonu</Text>
      <Text style={styles.status}>✅ Başarıyla çalışıyor!</Text>
      <Text style={styles.info}>
        Bu mobil uygulamanın web versiyonudur. Tüm React Native bileşenleri React Native Web ile render ediliyor.
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    color: '#666',
    marginBottom: 20,
  },
  status: {
    fontSize: 24,
    color: '#4CAF50',
    marginBottom: 20,
    fontWeight: 'bold',
  },
  info: {
    fontSize: 16,
    color: '#555',
    textAlign: 'center',
    lineHeight: 24,
    maxWidth: 400,
  },
});

export default App;