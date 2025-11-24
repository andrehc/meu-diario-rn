import { useTheme } from '@/src/hooks';
import { View, type ViewProps } from 'react-native';

export type ThemedViewProps = ViewProps & {
  lightColor?: string;
  darkColor?: string;
  variant?: 'background' | 'surface' | 'card';
};

export function ThemedView({ style, lightColor, darkColor, variant, ...otherProps }: ThemedViewProps) {
  const { colors, isLight } = useTheme();
  let backgroundColor;
  
  if (lightColor && darkColor) {
    backgroundColor = isLight ? lightColor : darkColor;
  } else if (variant) {
    switch (variant) {
      case 'card': backgroundColor = colors.cardBackground; break;
      case 'surface': backgroundColor = colors.surface; break;
      default: backgroundColor = colors.background;
    }
  } else {
    backgroundColor = colors.background;
  }

  return <View style={[{ backgroundColor }, style]} {...otherProps} />;
}