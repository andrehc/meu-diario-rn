import { View, type ViewProps } from 'react-native';
import { useThemeColor } from '@/src/hooks';

export type ThemedViewProps = ViewProps & {
  lightColor?: string;
  darkColor?: string;
  variant?: 'background' | 'surface' | 'card';
};

export function ThemedView({ style, lightColor, darkColor, variant, ...otherProps }: ThemedViewProps) {
  let backgroundColor;
  
  if (lightColor && darkColor) {
    backgroundColor = useThemeColor({ light: lightColor, dark: darkColor }, 'background');
  } else if (variant) {
    switch (variant) {
      case 'card': backgroundColor = useThemeColor({}, 'cardBackground'); break;
      case 'surface': backgroundColor = useThemeColor({}, 'surface'); break;
      default: backgroundColor = useThemeColor({}, 'background');
    }
  } else {
    backgroundColor = useThemeColor({ light: lightColor, dark: darkColor }, 'background');
  }

  return <View style={[{ backgroundColor }, style]} {...otherProps} />;
}