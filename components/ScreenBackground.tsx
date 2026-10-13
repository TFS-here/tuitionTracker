import React, { memo } from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../constants/theme';

interface ScreenBackgroundProps {
  children?: React.ReactNode;
  style?: ViewStyle;
  showCenterOrb?: boolean;
}

/**
 * Reusable ambient background container.
 * Encapsulates the multi-stop linear gradient and depth-enhancing glowing orbs.
 * Conforms to DRY and SRP.
 */
function ScreenBackgroundComponent({
  children,
  style,
  showCenterOrb = false,
}: ScreenBackgroundProps) {
  return (
    <View style={[styles.container, style]}>
      {/* Full-bleed base gradient */}
      <LinearGradient
        colors={[Colors.gradientStart, Colors.gradientMid, Colors.gradientEnd]}
        style={StyleSheet.absoluteFill}
        start={{ x: 0.1, y: 0 }}
        end={{ x: 0.9, y: 1 }}
      />

      {/* Ambient background glowing orbs */}
      <View style={styles.orbTopRight} pointerEvents="none" />
      <View style={styles.orbBottomLeft} pointerEvents="none" />
      {showCenterOrb && <View style={styles.orbCenter} pointerEvents="none" />}

      {children}
    </View>
  );
}

export const ScreenBackground = memo(ScreenBackgroundComponent);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  orbTopRight: {
    position: 'absolute',
    top: -100,
    right: -100,
    width: 320,
    height: 320,
    borderRadius: 160,
    backgroundColor: Colors.accentGlow,
    opacity: 0.6,
  },
  orbBottomLeft: {
    position: 'absolute',
    bottom: 0,
    left: -120,
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: Colors.blueGlow,
    opacity: 0.25,
  },
  orbCenter: {
    position: 'absolute',
    top: '40%',
    left: '25%',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(109,40,217,0.08)',
  },
});
