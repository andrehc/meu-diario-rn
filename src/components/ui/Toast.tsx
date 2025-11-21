import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useRef } from 'react';
import {
    Animated,
    Dimensions,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useTheme } from '../../hooks/useTheme';

// Definições de estilo
const shadows = {
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
};

const spacing = {
  xs: 4,
  s: 8,
  m: 16,
  l: 24,
};

export type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastProps {
  visible: boolean;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
  onHide: () => void;
  actionText?: string;
  onActionPress?: () => void;
}

const { width } = Dimensions.get('window');

export function Toast({
  visible,
  type,
  title,
  message,
  duration = 4000,
  onHide,
  actionText,
  onActionPress,
}: ToastProps) {
  const { colors } = useTheme();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(-100)).current;

  const getToastConfig = () => {
    switch (type) {
      case 'success':
        return {
          backgroundColor: colors.success,
          icon: 'checkmark-circle' as const,
            iconColor: colors.baseColor,
        };
      case 'error':
        return {
          backgroundColor: colors.error,
          icon: 'close-circle' as const,
          iconColor: colors.baseColor,
        };
      case 'warning':
        return {
          backgroundColor: colors.warning,
          icon: 'warning' as const,
          iconColor: colors.baseColor,
        };
      case 'info':
      default:
        return {
          backgroundColor: colors.info,
          icon: 'information-circle' as const,
          iconColor: colors.baseColor,
        };
    }
  };

  const config = getToastConfig();

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();

      const timer = setTimeout(() => {
        hideToast();
      }, duration);

      return () => clearTimeout(timer);
    } else {
      hideToast();
    }
  }, [visible, duration]);

  const hideToast = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: -100,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onHide();
    });
  };

  if (!visible) return null;

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <View
        style={[
          styles.toast,
          {
            backgroundColor: config.backgroundColor,
          },
        ]}
      >
        <View style={styles.content}>
          <Ionicons
            name={config.icon}
            size={24}
            color={config.iconColor}
            style={styles.icon}
          />
          <View style={styles.textContainer}>
            <Text style={[styles.title, { color: config.iconColor }]}>
              {title}
            </Text>
            {message && (
              <Text style={[styles.message, { color: config.iconColor }]}>
                {message}
              </Text>
            )}
          </View>
        </View>
        
        {actionText && onActionPress && (
          <TouchableOpacity
            style={styles.actionButton}
            onPress={onActionPress}
          >
            <Text style={[styles.actionText, { color: config.iconColor }]}>
              {actionText}
            </Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={styles.closeButton}
          onPress={hideToast}
        >
          <Ionicons
            name="close"
            size={20}
            color={config.iconColor}
          />
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 60,
    left: spacing.m,
    right: spacing.m,
    zIndex: 9999,
  },
  toast: {
    borderRadius: 12,
    padding: spacing.m,
    ...shadows.md,
    elevation: 8,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  icon: {
    marginRight: spacing.s,
    marginTop: 2,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  message: {
    fontSize: 14,
    opacity: 0.9,
    lineHeight: 20,
  },
  actionButton: {
    marginTop: spacing.s,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.s,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  actionText: {
    fontSize: 14,
    fontWeight: '600',
  },
  closeButton: {
    position: 'absolute',
    top: spacing.xs,
    right: spacing.xs,
    padding: spacing.xs,
  },
});