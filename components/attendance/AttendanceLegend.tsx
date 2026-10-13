import React, { memo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { Colors, FontSize, Radius, Spacing } from '../../constants/theme';

interface StatusConfigItem {
  label: string;
  color: string;
  icon: keyof typeof Ionicons.glyphMap;
}

interface AttendanceLegendProps {
  statusConfigs: Record<string, StatusConfigItem>;
}

function LegendItem({
  color,
  label,
  icon,
}: {
  color: string;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
}) {
  return (
    <View style={styles.legendItem}>
      <Ionicons name={icon} size={14} color={color} />
      <Text style={[styles.legendLabel, { color }]}>{label}</Text>
    </View>
  );
}

function AttendanceLegendComponent({ statusConfigs }: AttendanceLegendProps) {
  return (
    <View style={styles.legendCard}>
      <BlurView intensity={18} tint="dark" style={StyleSheet.absoluteFill} />
      <Text style={styles.legendTitle}>Tap a date to toggle status</Text>
      <View style={styles.legendRow}>
        {Object.entries(statusConfigs).map(([key, cfg]) => (
          <LegendItem key={key} color={cfg.color} label={cfg.label} icon={cfg.icon} />
        ))}
        <LegendItem color={Colors.textMuted} label="Clear" icon="ellipse-outline" />
      </View>
      <Text style={styles.legendCycle}>
        Cycle: <Text style={{ color: Colors.taught }}>Taught</Text>
        {' → '}
        <Text style={{ color: Colors.skipped }}>Skipped</Text>
        {' → '}
        <Text style={{ color: Colors.cancelled }}>Cancelled</Text>
        {' → Clear'}
      </Text>
    </View>
  );
}

export const AttendanceLegend = memo(AttendanceLegendComponent);

const styles = StyleSheet.create({
  legendCard: {
    borderRadius: Radius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.glass,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    gap: 10,
  },
  legendTitle: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  legendRow: {
    flexDirection: 'row',
    gap: 16,
    flexWrap: 'wrap',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  legendLabel: {
    fontSize: FontSize.xs,
    fontWeight: '500',
  },
  legendCycle: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
  },
});
