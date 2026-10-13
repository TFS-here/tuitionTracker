import React, { memo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { Colors, FontSize, Radius, Spacing } from '../../constants/theme';
import { formatBDT } from '../../utils/attendance';

interface AttendanceStatsProps {
  taughtCount: number;
  skippedCount: number;
  cancelledCount: number;
  earningsThisMonth: number;
}

function MiniStat({
  label,
  value,
  color,
  icon,
}: {
  label: string;
  value: number | string;
  color: string;
  icon: keyof typeof Ionicons.glyphMap;
}) {
  return (
    <View style={[styles.miniStat, { borderColor: color + '33' }]}>
      <BlurView intensity={18} tint="dark" style={StyleSheet.absoluteFill} />
      <Ionicons name={icon} size={18} color={color} />
      <Text style={[styles.miniValue, { color }]}>{value}</Text>
      <Text style={styles.miniLabel}>{label}</Text>
    </View>
  );
}

function AttendanceStatsComponent({
  taughtCount,
  skippedCount,
  cancelledCount,
  earningsThisMonth,
}: AttendanceStatsProps) {
  return (
    <View style={styles.statsRow}>
      <MiniStat
        label="Taught"
        value={taughtCount}
        color={Colors.taught}
        icon="checkmark-circle"
      />
      <MiniStat
        label="Skipped"
        value={skippedCount}
        color={Colors.skipped}
        icon="time"
      />
      <MiniStat
        label="Cancelled"
        value={cancelledCount}
        color={Colors.cancelled}
        icon="close-circle"
      />
      <MiniStat
        label="Earnings"
        value={formatBDT(earningsThisMonth)}
        color={Colors.blueLight}
        icon="cash"
      />
    </View>
  );
}

export const AttendanceStats = memo(AttendanceStatsComponent);

const styles = StyleSheet.create({
  statsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: Spacing.md,
  },
  miniStat: {
    flex: 1,
    borderRadius: Radius.md,
    overflow: 'hidden',
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    gap: 2,
    backgroundColor: Colors.glass,
  },
  miniValue: {
    fontSize: FontSize.md,
    fontWeight: '700',
  },
  miniLabel: {
    fontSize: 9,
    color: Colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});
