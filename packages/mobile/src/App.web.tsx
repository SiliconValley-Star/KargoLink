import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

// Web için basit bir App wrapper
const AppWeb: React.FC = () => {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>🚛 CargoLink Mobile</Text>
        <Text style={styles.subtitle}>React Native Web App</Text>
      </View>
      
      <View style={styles.content}>
        <Text style={styles.message}>
          CargoLink Mobile uygulaması web üzerinde çalışıyor!
        </Text>
        
        <View style={styles.features}>
          <Text style={styles.feature}>✅ React Native Web</Text>
          <Text style={styles.feature}>✅ Hot Reload Aktif</Text>
          <Text style={styles.feature}>✅ TypeScript Support</Text>
          <Text style={styles.feature}>✅ Vite Build System</Text>
        </View>
      </View>
      
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Port 3003 - Development Mode
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    color: '#7f8c8d',
  },
  content: {
    alignItems: 'center',
    maxWidth: 400,
  },
  message: {
    fontSize: 16,
    textAlign: 'center',
    color: '#34495e',
    marginBottom: 30,
    lineHeight: 24,
  },
  features: {
    alignItems: 'flex-start',
  },
  feature: {
    fontSize: 14,
    color: '#27ae60',
    marginBottom: 8,
    fontWeight: '600',
  },
  footer: {
    position: 'absolute',
    bottom: 20,
  },
  footerText: {
    fontSize: 12,
    color: '#95a5a6',
  },
});

export default AppWeb;