import { useTheme } from '@/src/hooks';
import React from 'react';
import { Platform, StatusBar, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface StatusBarBackgroundProps {
  backgroundColor?: string;
}

export function StatusBarBackground({ 
  backgroundColor 
}: StatusBarBackgroundProps) {
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useTheme();
  
  const bgColor = backgroundColor || colors.baseColor;
  const barStyle = isDark ? 'light-content' : 'dark-content';

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