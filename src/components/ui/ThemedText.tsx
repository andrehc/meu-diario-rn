import React from 'react';
import { StyleSheet, Text, type TextProps } from 'react-native';
import { useThemeColor, useTheme } from '@/src/hooks';

export type ThemedTextProps = TextProps & {
  lightColor?: string;
  darkColor?: string;
  type?: 'default' | 'title' | 'defaultSemiBold' | 'subtitle' | 'link';
  variant?: 'h1' | 'h2' | 'h3' | 'body' | 'caption';
  color?: 'primary' | 'secondary' | 'tertiary' | 'inverse';
};

export function ThemedText({
  style,
  lightColor,
  darkColor,
  type = 'default',
  variant,
  color: colorProp,
  ...rest
}: ThemedTextProps) {
  const { colors } = useTheme();
  
  // Determinar cor final
  let finalColor: string;
  if (lightColor && darkColor) {
    finalColor = useThemeColor({ light: lightColor, dark: darkColor }, 'text');
  } else if (colorProp) {
    const textColors = colors.text;
    switch (colorProp) {
      case 'primary': 
        finalColor = (typeof textColors === 'object' && textColors.primary) 
          ? textColors.primary 
          : (typeof textColors === 'string' ? textColors : '#000'); 
        break;
      case 'secondary': 
        finalColor = (typeof textColors === 'object' && textColors.secondary) 
          ? textColors.secondary 
          : colors.icon || '#666'; 
        break;
      case 'tertiary': 
        finalColor = (typeof textColors === 'object' && textColors.tertiary) 
          ? textColors.tertiary 
          : colors.icon || '#999'; 
        break;
      case 'inverse': 
        finalColor = (typeof textColors === 'object' && textColors.inverse) 
          ? textColors.inverse 
          : '#fff'; 
        break;
      default: 
        finalColor = (typeof textColors === 'string' ? textColors : '#000');
    }
  } else {
    finalColor = useThemeColor({ light: lightColor, dark: darkColor }, 'text');
  }
  
  // Determinar estilo do variant
  const variantStyle = variant ? getVariantStyle(variant) : undefined;

  return (
    <Text
      style={[
        { color: finalColor },
        type === 'default' ? styles.default : undefined,
        type === 'title' ? styles.title : undefined,
        type === 'defaultSemiBold' ? styles.defaultSemiBold : undefined,
        type === 'subtitle' ? styles.subtitle : undefined,
        type === 'link' ? styles.link : undefined,
        variantStyle,
        style,
      ]}
      {...rest}
    />
  );
}

function getVariantStyle(variant: string) {
  switch (variant) {
    case 'h1': return { fontSize: 30, fontWeight: '700' as const };
    case 'h2': return { fontSize: 24, fontWeight: '700' as const };
    case 'h3': return { fontSize: 20, fontWeight: '600' as const };
    case 'body': return { fontSize: 16, fontWeight: '400' as const };
    case 'caption': return { fontSize: 12, fontWeight: '400' as const };
    default: return undefined;
  }
}

const styles = StyleSheet.create({
  default: {
    fontSize: 16,
    lineHeight: 24,
  },
  defaultSemiBold: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '600',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    lineHeight: 32,
  },
  subtitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  link: {
    lineHeight: 30,
    fontSize: 16,
    color: '#0a7ea4',
  },
});