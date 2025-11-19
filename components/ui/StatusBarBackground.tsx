import React from 'react';
import { View, StyleSheet, StatusBar, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface StatusBarBackgroundProps {
  backgroundColor?: string;
}

export default function StatusBarBackground({ 
  backgroundColor = '#934730' 
}: StatusBarBackgroundProps) {
  const insets = useSafeAreaInsets();

  return (
    <>
      {/* StatusBar Configuration */}
      <StatusBar 
        backgroundColor={backgroundColor}
        barStyle="light-content"
        translucent={Platform.OS === 'android'}
      />
      
      {/* Background View for Status Bar Area */}
      <View 
        style={[
          styles.statusBarBackground,
          { 
            backgroundColor,
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