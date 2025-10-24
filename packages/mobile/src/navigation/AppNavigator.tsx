import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {StatusBar} from 'react-native';

// Contexts
import {useAuth} from '../contexts/AuthContext';
import {useTheme} from '../contexts/ThemeContext';

// Auth Screens
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import ForgotPasswordScreen from '../screens/auth/ForgotPasswordScreen';
import ResetPasswordScreen from '../screens/auth/ResetPasswordScreen';

// Main Screens
import HomeScreen from '../screens/main/HomeScreen';
import ShipmentCreateScreen from '../screens/shipment/ShipmentCreateScreen';
import ShipmentListScreen from '../screens/shipment/ShipmentListScreen';
import ShipmentDetailScreen from '../screens/shipment/ShipmentDetailScreen';
import TrackingScreen from '../screens/tracking/TrackingScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';
import NotificationsScreen from '../screens/notifications/NotificationsScreen';

// Components
import TabBarIcon from '../components/common/TabBarIcon';
import LoadingScreen from '../components/common/LoadingScreen';

// Navigation Types
export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
  ResetPassword: {token: string};
};

export type MainTabParamList = {
  Home: undefined;
  Shipments: undefined;
  Track: undefined;
  Profile: undefined;
};

export type ShipmentStackParamList = {
  ShipmentList: undefined;
  ShipmentCreate: undefined;
  ShipmentDetail: {shipmentId: string};
};

export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
  Notifications: undefined;
  ShipmentCreate: undefined;
  ShipmentDetail: {shipmentId: string};
  TrackingDetail: {trackingNumber: string};
};

// Stack Navigators
const AuthStack = createNativeStackNavigator<AuthStackParamList>();
const MainTab = createBottomTabNavigator<MainTabParamList>();
const ShipmentStack = createNativeStackNavigator<ShipmentStackParamList>();
const RootStack = createNativeStackNavigator<RootStackParamList>();

// Auth Navigation
const AuthNavigator = () => {
  const {theme} = useTheme();
  
  return (
    <AuthStack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: theme.colors.surface,
        },
        headerTintColor: theme.colors.onSurface,
        headerTitleStyle: {
          fontFamily: theme.typography.headerFont,
          fontSize: theme.typography.h2.fontSize,
          fontWeight: theme.typography.h2.fontWeight,
        },
        contentStyle: {
          backgroundColor: theme.colors.background,
        },
      }}>
      <AuthStack.Screen 
        name="Login" 
        component={LoginScreen}
        options={{
          title: 'Giriş Yap',
          headerShown: false,
        }}
      />
      <AuthStack.Screen 
        name="Register" 
        component={RegisterScreen}
        options={{
          title: 'Kayıt Ol',
          headerBackTitleVisible: false,
        }}
      />
      <AuthStack.Screen 
        name="ForgotPassword" 
        component={ForgotPasswordScreen}
        options={{
          title: 'Şifremi Unuttum',
          headerBackTitleVisible: false,
        }}
      />
      <AuthStack.Screen 
        name="ResetPassword" 
        component={ResetPasswordScreen}
        options={{
          title: 'Şifre Sıfırla',
          headerBackTitleVisible: false,
        }}
      />
    </AuthStack.Navigator>
  );
};

// Shipment Stack Navigator
const ShipmentNavigator = () => {
  const {theme} = useTheme();
  
  return (
    <ShipmentStack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: theme.colors.surface,
        },
        headerTintColor: theme.colors.onSurface,
        headerTitleStyle: {
          fontFamily: theme.typography.headerFont,
          fontSize: theme.typography.h3.fontSize,
          fontWeight: theme.typography.h3.fontWeight,
        },
      }}>
      <ShipmentStack.Screen 
        name="ShipmentList" 
        component={ShipmentListScreen}
        options={{
          title: 'Gönderi Listesi',
          headerShown: false,
        }}
      />
      <ShipmentStack.Screen 
        name="ShipmentCreate" 
        component={ShipmentCreateScreen}
        options={{
          title: 'Yeni Gönderi',
          headerBackTitleVisible: false,
        }}
      />
      <ShipmentStack.Screen 
        name="ShipmentDetail" 
        component={ShipmentDetailScreen}
        options={{
          title: 'Gönderi Detayı',
          headerBackTitleVisible: false,
        }}
      />
    </ShipmentStack.Navigator>
  );
};

// Main Tab Navigator
const MainNavigator = () => {
  const {theme, isDarkMode} = useTheme();
  
  return (
    <MainTab.Navigator
      screenOptions={({route}) => ({
        tabBarIcon: ({focused, color, size}) => (
          <TabBarIcon
            route={route}
            focused={focused}
            color={color}
            size={size}
          />
        ),
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.onSurfaceVariant,
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          borderTopColor: theme.colors.outline,
          borderTopWidth: 0.5,
          paddingTop: theme.spacing.xs,
          paddingBottom: theme.spacing.xs,
          height: 65,
        },
        tabBarLabelStyle: {
          fontFamily: theme.typography.bodyFont,
          fontSize: theme.typography.caption.fontSize,
          fontWeight: theme.typography.caption.fontWeight,
        },
        headerStyle: {
          backgroundColor: theme.colors.surface,
          elevation: 0,
          shadowOpacity: 0,
          borderBottomWidth: 0.5,
          borderBottomColor: theme.colors.outline,
        },
        headerTintColor: theme.colors.onSurface,
        headerTitleStyle: {
          fontFamily: theme.typography.headerFont,
          fontSize: theme.typography.h2.fontSize,
          fontWeight: theme.typography.h2.fontWeight,
        },
      })}>
      <MainTab.Screen 
        name="Home" 
        component={HomeScreen}
        options={{
          title: 'Ana Sayfa',
          tabBarLabel: 'Ana Sayfa',
        }}
      />
      <MainTab.Screen 
        name="Shipments" 
        component={ShipmentNavigator}
        options={{
          title: 'Gönderiler',
          tabBarLabel: 'Gönderiler',
          headerShown: false,
        }}
      />
      <MainTab.Screen 
        name="Track" 
        component={TrackingScreen}
        options={{
          title: 'Takip',
          tabBarLabel: 'Takip',
        }}
      />
      <MainTab.Screen 
        name="Profile" 
        component={ProfileScreen}
        options={{
          title: 'Profil',
          tabBarLabel: 'Profil',
        }}
      />
    </MainTab.Navigator>
  );
};

// Root Navigator
const RootNavigator = () => {
  const {theme} = useTheme();
  
  return (
    <RootStack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: theme.colors.surface,
        },
        headerTintColor: theme.colors.onSurface,
        contentStyle: {
          backgroundColor: theme.colors.background,
        },
        presentation: 'modal',
      }}>
      <RootStack.Screen 
        name="Main" 
        component={MainNavigator}
        options={{
          headerShown: false,
        }}
      />
      <RootStack.Screen 
        name="Notifications" 
        component={NotificationsScreen}
        options={{
          title: 'Bildirimler',
          presentation: 'modal',
        }}
      />
      <RootStack.Screen 
        name="ShipmentCreate" 
        component={ShipmentCreateScreen}
        options={{
          title: 'Yeni Gönderi Oluştur',
          presentation: 'modal',
        }}
      />
      <RootStack.Screen 
        name="ShipmentDetail" 
        component={ShipmentDetailScreen}
        options={{
          title: 'Gönderi Detayı',
          presentation: 'card',
        }}
      />
      <RootStack.Screen 
        name="TrackingDetail" 
        component={TrackingScreen}
        options={{
          title: 'Gönderi Takibi',
          presentation: 'card',
        }}
      />
    </RootStack.Navigator>
  );
};

// Main App Navigator
const AppNavigator: React.FC = () => {
  const {isAuthenticated, isLoading} = useAuth();
  const {theme, isDarkMode} = useTheme();

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <NavigationContainer
      theme={{
        dark: isDarkMode,
        colors: {
          primary: theme.colors.primary,
          background: theme.colors.background,
          card: theme.colors.surface,
          text: theme.colors.onSurface,
          border: theme.colors.outline,
          notification: theme.colors.error,
        },
      }}>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={theme.colors.surface}
      />
      {isAuthenticated ? <RootNavigator /> : <AuthNavigator />}
    </NavigationContainer>
  );
};

export default AppNavigator;