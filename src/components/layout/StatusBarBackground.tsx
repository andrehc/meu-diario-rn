import React from 'react';
import { View, StyleSheet, StatusBar, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useThemeColor, useColorScheme } from '@/src/hooks';

interface StatusBarBackgroundProps {
  backgroundColor?: string;
}

export function StatusBarBackground({ 
  backgroundColor 
}: StatusBarBackgroundProps) {
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const defaultBgColor = useThemeColor({}, 'baseColor');
  
  const bgColor = backgroundColor || defaultBgColor;
  const barStyle = colorScheme === 'dark' ? 'light-content' : 'light-content';

  return (
    <>
      <StatusBar 
        backgroundColor={bgColor}
        barStyle={barStyle}
        translucent={Platform.OS === 'android'}
      />
      
      <View 
        style={[
          styles.statusBarBackground,
          { 
            backgroundColor: bgColor,
            height: insets.top || (Platform.OS === 'android' ? StatusBar.currentHeight : 0)
          }
        ]}
      />
    </>
  );
}

const styles = StyleSheet.create({
  statusBarBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
  },
});

export default StatusBarBackground;