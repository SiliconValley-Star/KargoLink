/**
 * CargoLink Mobile App Theme System
 * Material Design 3 inspired theme with semantic colors
 */

// CargoLink Premium Brand Colors - Light Theme
const lightColors = {
  // Primary colors - Electric Blue
  primary: '#0066FF',
  onPrimary: '#FFFFFF',
  primaryContainer: '#E6F2FF',
  onPrimaryContainer: '#003D99',
  
  // Secondary colors - Emerald Green
  secondary: '#10B981',
  onSecondary: '#FFFFFF',
  secondaryContainer: '#E6F7F2',
  onSecondaryContainer: '#064E3B',
  
  // Tertiary colors - Premium Orange
  tertiary: '#F59E0B',
  onTertiary: '#FFFFFF',
  tertiaryContainer: '#FEF3E0',
  onTertiaryContainer: '#92400E',
  
  // Surface colors
  surface: '#FFFFFF',
  onSurface: '#1C1B1F',
  surfaceVariant: '#F4F4F4',
  onSurfaceVariant: '#49454F',
  
  // Background colors
  background: '#FEFBFF',
  onBackground: '#1C1B1F',
  
  // Error colors - Danger Red
  error: '#EF4444',
  onError: '#FFFFFF',
  errorContainer: '#FEF2F2',
  onErrorContainer: '#B91C1C',
  
  // Warning colors - Warning Amber
  warning: '#F59E0B',
  onWarning: '#FFFFFF',
  warningContainer: '#FEF3E0',
  onWarningContainer: '#92400E',
  
  // Success colors - Success Green
  success: '#22C55E',
  onSuccess: '#FFFFFF',
  successContainer: '#F0FDF4',
  onSuccessContainer: '#15803D',
  
  // Info colors
  info: '#0288D1',
  onInfo: '#FFFFFF',
  infoContainer: '#E1F5FE',
  onInfoContainer: '#01579B',
  
  // Outline colors
  outline: '#79747E',
  outlineVariant: '#CAC4D0',
  
  // Shadow and scrim
  shadow: '#000000',
  scrim: '#000000',
  
  // Utility colors
  white: '#FFFFFF',
  black: '#000000',
  transparent: 'transparent',
  
  // Text colors
  text: '#1C1B1F',
  textSecondary: '#79747E',
  
  // Border colors
  border: '#CAC4D0',
  
  // Primary variations
  primaryLight: '#64B5F6',
};

// CargoLink Premium Brand Colors - Dark Theme
const darkColors = {
  // Primary colors - Electric Blue Dark
  primary: '#4D9FFF',
  onPrimary: '#002952',
  primaryContainer: '#0052CC',
  onPrimaryContainer: '#CCE0FF',
  
  // Secondary colors - Emerald Green Dark
  secondary: '#34D399',
  onSecondary: '#064E3B',
  secondaryContainer: '#059669',
  onSecondaryContainer: '#D1FAE5',
  
  // Tertiary colors - Premium Orange Dark
  tertiary: '#FBBF24',
  onTertiary: '#78350F',
  tertiaryContainer: '#D97706',
  onTertiaryContainer: '#FEF3C7',
  
  // Surface colors
  surface: '#121212',
  onSurface: '#E6E1E5',
  surfaceVariant: '#1E1E1E',
  onSurfaceVariant: '#CAC4D0',
  
  // Background colors
  background: '#1C1B1F',
  onBackground: '#E6E1E5',
  
  // Error colors - Danger Red Dark
  error: '#F87171',
  onError: '#7F1D1D',
  errorContainer: '#DC2626',
  onErrorContainer: '#FEE2E2',
  
  // Warning colors - Warning Amber Dark
  warning: '#FBBF24',
  onWarning: '#78350F',
  warningContainer: '#D97706',
  onWarningContainer: '#FEF3C7',
  
  // Success colors - Success Green Dark
  success: '#4ADE80',
  onSuccess: '#14532D',
  successContainer: '#16A34A',
  onSuccessContainer: '#DCFCE7',
  
  // Info colors
  info: '#4FC3F7',
  onInfo: '#01579B',
  infoContainer: '#0288D1',
  onInfoContainer: '#E1F5FE',
  
  // Outline colors
  outline: '#938F99',
  outlineVariant: '#49454F',
  
  // Shadow and scrim
  shadow: '#000000',
  scrim: '#000000',
  
  // Utility colors
  white: '#FFFFFF',
  black: '#000000',
  transparent: 'transparent',
  
  // Text colors
  text: '#E6E1E5',
  textSecondary: '#938F99',
  
  // Border colors
  border: '#49454F',
  
  // Primary variations
  primaryLight: '#64B5F6',
};

export const typography = {
  // Font families
  headerFont: 'System',
  bodyFont: 'System',
  
  fontFamily: {
    regular: 'System',
    medium: 'System',
    semibold: 'System',
    bold: 'System',
  },
  
  // Typography scale
  h1: {
    fontSize: 32,
    lineHeight: 40,
    fontWeight: '700' as const,
  },
  h2: {
    fontSize: 28,
    lineHeight: 36,
    fontWeight: '600' as const,
  },
  h3: {
    fontSize: 24,
    lineHeight: 32,
    fontWeight: '600' as const,
  },
  h4: {
    fontSize: 20,
    lineHeight: 28,
    fontWeight: '500' as const,
  },
  h5: {
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '500' as const,
  },
  h6: {
    fontSize: 16,
    lineHeight: 20,
    fontWeight: '500' as const,
  },
  body1: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '400' as const,
  },
  body2: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '400' as const,
  },
  subtitle1: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '500' as const,
  },
  subtitle2: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '500' as const,
  },
  caption: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '400' as const,
  },
  button: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '500' as const,
  },
  overline: {
    fontSize: 10,
    lineHeight: 16,
    fontWeight: '500' as const,
  },
  
  fontSize: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 28,
    '4xl': 32,
  },
  lineHeight: {
    xs: 16,
    sm: 20,
    md: 24,
    lg: 28,
    xl: 32,
    '2xl': 36,
    '3xl': 40,
    '4xl': 44,
  },
  fontWeight: {
    light: '300' as const,
    normal: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
  },
};

export const spacing = {
  // Named spacing
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  '3xl': 32,
  '4xl': 40,
  
  // Numeric spacing
  0: 0,
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  8: 32,
  10: 40,
  12: 48,
  16: 64,
  20: 80,
  24: 96,
  32: 128,
};

export const borderRadius = {
  none: 0,
  xs: 2,
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  '2xl': 24,
  '3xl': 32,
  full: 9999,
};

export const shadows = {
  none: {
    shadowColor: 'transparent',
    shadowOffset: {width: 0, height: 0},
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  sm: {
    shadowColor: '#000000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  md: {
    shadowColor: '#000000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
  xl: {
    shadowColor: '#000000',
    shadowOffset: {width: 0, height: 8},
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 12,
  },
};

export const theme = {
  colors: lightColors,
  typography,
  spacing,
  borderRadius,
  shadows,
} as const;

export const darkTheme = {
  colors: darkColors,
  typography,
  spacing,
  borderRadius,
  shadows,
} as const;

// Export type for theme
export type Theme = typeof theme;