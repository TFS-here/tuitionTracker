import React, { memo } from 'react';
import { Text, StyleSheet, Animated } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Colors, FontSize, Radius, Spacing } from '../../constants/theme';

interface ToastNotificationProps {
  message: string | null;
  bottomInset: number;
  translateY: Animated.Value;
}

function ToastNotificationComponent({
  message,
  bottomInset,
  translateY,
}: ToastNotificationProps) {
  if (!message) return null;

  const iconName: keyof typeof Ionicons.glyphMap = message.includes('Taught')
    ? 'checkmark-circle'
    : message.includes('Skipped')
    ? 'time'
    : message.includes('Cancelled')
    ? 'close-circle'
    : 'ellipse-outline';

  return (
    <Animated.View
      style={[
        styles.toastWrapper,
        {
          bottom: bottomInset + 90,
          transform: [{ translateY }],
        },
      ]}
      pointerEvents="none"
    >
      <BlurView intensity={30} tint="dark" style={StyleSheet.absoluteFill} />
      <LinearGradient
        colors={[Colors.accent, Colors.accentLight]}
        style={styles.toastAccent}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
      />
      <Ionicons name={iconName} size={20} color={Colors.accentLight} />
      <Text style={styles.toastText}>{message}</Text>
    </Animated.View>
  );
}

export const ToastNotification = memo(ToastNotificationComponent);

const styles = StyleSheet.create({
  toastWrapper: {
    position: 'absolute',
    left: Spacing.lg,
    right: Spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: Radius.lg,
    overflow: 'hidden',
    backgroundColor: Colors.glass,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
    zIndex: 999,
  },
  toastAccent: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
  },
  toastText: {
    color: Colors.textPrimary,
    fontSize: FontSize.md,
    fontWeight: '600',
  },
});
