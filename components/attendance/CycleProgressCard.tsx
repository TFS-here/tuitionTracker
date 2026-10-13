import React, { memo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { BlurView } from 'expo-blur';
import { Colors, FontSize, Radius, Spacing } from '../../constants/theme';
import { formatBDT } from '../../utils/attendance';
import { APP_CONFIG } from '../../constants/config';

interface CycleProgressCardProps {
  cycleDays: number;
  ratePerMonth: number;
  monthsDue: number;
  totalDue: number;
  taughtAllTime: number;
}

function CycleProgressCardComponent({
  cycleDays,
  ratePerMonth,
  monthsDue,
  totalDue,
  taughtAllTime,
}: CycleProgressCardProps) {
  const daysPerCycle = APP_CONFIG.DAYS_PER_CYCLE;
  const progressPct = daysPerCycle > 0 ? Math.min((cycleDays / daysPerCycle) * 100, 100) : 0;

  return (
    <View style={styles.rateCard}>
      <BlurView intensity={18} tint="dark" style={StyleSheet.absoluteFill} />
      <View style={styles.content}>
        <View style={styles.headerRow}>
          <Text style={styles.rateText}>
            <Text style={{ color: Colors.accentLight, fontWeight: '700' }}>{cycleDays}</Text>
            <Text style={{ color: Colors.textMuted }}> / {daysPerCycle} days this cycle</Text>
          </Text>
          <Text style={styles.rateText}>
            {formatBDT(ratePerMonth)}
            <Text style={{ color: Colors.textMuted }}>/month</Text>
          </Text>
        </View>

        {/* Progress bar */}
        <View style={styles.cycleTrack}>
          <View style={[styles.cycleFill, { width: `${progressPct}%` }]} />
        </View>

        {monthsDue > 0 ? (
          <Text style={styles.rateEarnings}>
            🔴 {monthsDue} payment{monthsDue > 1 ? 's' : ''} due ·{' '}
            <Text style={{ color: '#FF8A65', fontWeight: '700' }}>{formatBDT(totalDue)}</Text>
          </Text>
        ) : (
          <Text style={styles.rateEarnings}>
            ✅ All paid · Total taught: {taughtAllTime} classes
          </Text>
        )}
      </View>
    </View>
  );
}

export const CycleProgressCard = memo(CycleProgressCardComponent);

const styles = StyleSheet.create({
  rateCard: {
    borderRadius: Radius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.glass,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  content: {
    gap: 6,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  rateText: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
  },
  cycleTrack: {
    height: 5,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.07)',
    overflow: 'hidden',
    width: '100%',
  },
  cycleFill: {
    height: '100%',
    borderRadius: 3,
    backgroundColor: Colors.accentLight,
  },
  rateEarnings: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    marginTop: 2,
  },
});
