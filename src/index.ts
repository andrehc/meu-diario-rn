// ===== COMPONENTS =====
// UI Components
export { ThemedText } from './components/ui/ThemedText';
export { ThemedView } from './components/ui/ThemedView';
export { PinVerification } from './components/ui/PinVerification';
export { PinToggle } from './components/ui/PinToggle';
export { SplashScreen } from './components/ui/SplashScreen';

// Form Components
export { LoginForm } from './components/forms/LoginForm';
export { RegisterForm } from './components/forms/RegisterForm';

// Layout Components
export { BottomNavigation } from './components/layout/BottomNavigation';
export { StatusBarBackground } from './components/layout/StatusBarBackground';

// ===== HOOKS =====
export { useTheme, useThemeColor, useCustomColorScheme } from './hooks/useTheme';
export { useColorScheme } from './hooks/use-color-scheme';
export { useAuth } from './hooks/useAuth';
export { useLogout } from './hooks/useLogout';

// ===== CONTEXTS =====
export { AuthProvider, useAuth as useAuthContext } from './contexts/AuthContext';

// ===== THEME =====
export { Colors, theme, lightTheme, darkTheme } from './theme';
export { typography } from './theme/typography';
export { spacing, shadows } from './theme/spacing';

// ===== SERVICES =====
export { ProfileService } from './services/profileService';
export * as googleAuthService from './services/googleAuthService';

// ===== TYPES =====
export type { Profile, CreateLocalProfileData } from './types/database';

// ===== UTILS =====
export { hashPin, comparePin } from './utils/pinService';