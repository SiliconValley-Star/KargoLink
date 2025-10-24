// Export theme system (UI components need platform-specific implementations)
export * from './theme/colors';
export * from './theme/spacing';
export { typography as typographyTheme } from './theme/typography';

// UI Components will be platform-specific (React/React Native)
// Each platform should implement their own using the shared theme system