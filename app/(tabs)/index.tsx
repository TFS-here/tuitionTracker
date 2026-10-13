import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Dimensions,
  Animated,
  TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useStudents } from '../../hooks/useStudents';
import StatCard from '../../components/StatCard';
import {
  totalTaughtThisMonth,
  totalAmountDue,
  totalEverEarned,
  studentsWithPaymentDue,
  formatBDT,
  currentMonthName,
} from '../../utils/attendance';
import { Colors, Font, FontSize, Radius, Spacing } from '../../constants/theme';

import { ScreenBackground } from '../../components/ScreenBackground';
import { APP_CONFIG } from '../../constants/config';

const { width } = Dimensions.get('window');

export default function DashboardScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { students, loading } = useStudents();

  // Entrance animations
  const headerAnim = useRef(new Animated.Value(0)).current;
  const cardsAnim = useRef(new Animated.Value(0)).current;
  const listAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.stagger(120, [
      Animated.spring(headerAnim, { toValue: 1, useNativeDriver: true, damping: 18, stiffness: 120 }),
      Animated.spring(cardsAnim, { toValue: 1, useNativeDriver: true, damping: 18, stiffness: 120 }),
      Animated.spring(listAnim, { toValue: 1, useNativeDriver: true, damping: 18, stiffness: 120 }),
    ]).start();
  }, []);

  const taught = totalTaughtThisMonth(students);
  const amountDue = totalAmountDue(students);
  const everEarned = totalEverEarned(students);
  const dueCount = studentsWithPaymentDue(students).length;
  const monthName = currentMonthName();

  // Recent students
  const recentStudents = [...students].reverse().slice(0, APP_CONFIG.MAX_RECENT_STUDENTS);

  const animHeader = {
    opacity: headerAnim,
    transform: [{ translateY: headerAnim.interpolate({ inputRange: [0, 1], outputRange: [-20, 0] }) }],
  };
  const animCards = {
    opacity: cardsAnim,
    transform: [{ translateY: cardsAnim.interpolate({ inputRange: [0, 1], outputRange: [30, 0] }) }],
  };
  const animList = {
    opacity: listAnim,
    transform: [{ translateY: listAnim.interpolate({ inputRange: [0, 1], outputRange: [40, 0] }) }],
  };

  return (
    <ScreenBackground showCenterOrb>
      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          { paddingTop: insets.top + 20, paddingBottom: insets.bottom + 90 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Header ── */}
        <Animated.View style={[animHeader]}>
          <View style={styles.headerRow}>
            <View>
              <Text style={styles.greeting}>Good {getGreeting()} 👋</Text>
              <Text style={styles.headerTitle}>Dashboard</Text>
            </View>
            {/* Avatar circle */}
            <TouchableOpacity onPress={() => router.push('/(tabs)/profile')} activeOpacity={0.8}>
              <LinearGradient
                colors={[Colors.accent, Colors.accentLight]}
                style={styles.avatarCircle}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Ionicons name="person" size={22} color="#fff" />
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {/* Month label */}
          <View style={styles.monthRow}>
            <Ionicons name="calendar-outline" size={13} color={Colors.textMuted} />
            <Text style={styles.monthText}>{monthName}</Text>
          </View>
        </Animated.View>

        {/* ── Stat Cards ── */}
        <Animated.View style={[styles.statsGrid, animCards]}>
          {/* Wide card – Active Tuitions */}
          <View style={styles.statsRow}>
            <StatCard
              title="Active Tuitions"
              value={String(students.length)}
              subtitle="students enrolled"
              icon="school"
              gradientColors={[Colors.accent, Colors.accentLight]}
              glowColor={Colors.accent}
            />
            <StatCard
              title="Classes Taught"
              value={String(taught)}
              subtitle="this month"
              icon="checkmark-circle"
              gradientColors={[Colors.taught, '#34D399']}
              glowColor={Colors.taught}
            />
          </View>

          {/* Full-width Earnings card */}
          <EarningsCard amountDue={amountDue} everEarned={everEarned} dueCount={dueCount} />
        </Animated.View>

        {/* ── Recent Students ── */}
        {recentStudents.length > 0 && (
          <Animated.View style={animList}>
            <SectionHeader title="Recent Students" />
            {recentStudents.map((student, i) => (
              <RecentRow key={student.id} student={student} index={i} />
            ))}
          </Animated.View>
        )}

        {/* ── Empty state ── */}
        {students.length === 0 && !loading && (
          <Animated.View style={[styles.emptyState, animList]}>
            <LinearGradient
              colors={[Colors.accentGlow, 'transparent']}
              style={styles.emptyGlow}
            />
            <Ionicons name="school-outline" size={56} color={Colors.textMuted} />
            <Text style={styles.emptyTitle}>No Students Yet</Text>
            <Text style={styles.emptySubtitle}>
              Go to the Students tab to add your first tuition.
            </Text>
          </Animated.View>
        )}
      </ScrollView>
    </ScreenBackground>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────

function EarningsCard({
  amountDue,
  everEarned,
  dueCount,
}: {
  amountDue: number;
  everEarned: number;
  dueCount: number;
}) {
  const hasDue = amountDue > 0;
  return (
    <View style={[styles.earningsWrapper, hasDue && styles.earningsWrapperDue]}>
      <BlurView intensity={25} tint="dark" style={StyleSheet.absoluteFill} />
      <LinearGradient
        colors={
          hasDue
            ? ['rgba(255,112,67,0.18)', 'rgba(255,60,40,0.10)', 'transparent']
            : ['rgba(124,58,237,0.18)', 'rgba(37,99,235,0.12)', 'transparent']
        }
        style={StyleSheet.absoluteFill}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />
      <View style={styles.earningsInner}>
        <View style={{ flex: 1 }}>
          <Text style={styles.earningsLabel}>
            {hasDue ? '🔔 Payment Due' : '✅ All Paid Up'}
          </Text>
          <Text style={[styles.earningsValue, hasDue && { color: '#FF8A65' }]}>
            {formatBDT(amountDue)}
          </Text>
          <Text style={styles.earningsSubtitle}>
            {hasDue
              ? `from ${dueCount} student${dueCount > 1 ? 's' : ''} · Total earned: ${formatBDT(everEarned)}`
              : `Total collected: ${formatBDT(everEarned)}`}
          </Text>
        </View>
        <LinearGradient
          colors={hasDue ? ['#FF7043', '#FF8A65'] : [Colors.blue, Colors.blueLight]}
          style={styles.earningsIcon}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Ionicons name={hasDue ? 'alert-circle' : 'checkmark-circle'} size={26} color="#fff" />
        </LinearGradient>
      </View>
    </View>
  );
}

function SectionHeader({ title }: { title: string }) {
  return (
    <View style={styles.sectionRow}>
      <View style={styles.sectionAccent} />
      <Text style={styles.sectionTitle}>{title}</Text>
    </View>
  );
}

function RecentRow({ student, index }: { student: any; index: number }) {
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.spring(anim, {
      toValue: 1,
      useNativeDriver: true,
      delay: index * 60,
      damping: 18,
      stiffness: 150,
    }).start();
  }, []);

  return (
    <Animated.View
      style={[
        styles.recentRow,
        {
          opacity: anim,
          transform: [{ translateX: anim.interpolate({ inputRange: [0, 1], outputRange: [30, 0] }) }],
        },
      ]}
    >
      <BlurView intensity={18} tint="dark" style={StyleSheet.absoluteFill} />
      <LinearGradient
        colors={[Colors.accent, Colors.accentLight]}
        style={styles.recentAvatar}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <Text style={styles.recentAvatarText}>{student.name.charAt(0)}</Text>
      </LinearGradient>
      <View style={{ flex: 1 }}>
        <Text style={styles.recentName}>{student.name}</Text>
        <Text style={styles.recentSubject}>{student.subject}</Text>
      </View>
      <Text style={styles.recentRate}>{formatBDT(student.ratePerMonth)}/month</Text>
    </Animated.View>
  );
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Morning';
  if (h < 17) return 'Afternoon';
  return 'Evening';
}

// ── Styles ────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.bg },
  scroll: { paddingHorizontal: Spacing.lg },

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
  orbCenter: {
    position: 'absolute',
    top: '40%',
    right: -120,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: Colors.blueGlow,
    opacity: 0.25,
  },
  orbBottomLeft: {
    position: 'absolute',
    bottom: 80,
    left: -120,
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: Colors.taughtGlow,
    opacity: 0.2,
  },

  // Header
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  greeting: {
    fontSize: FontSize.sm,
    color: Colors.textMuted,
    marginBottom: 2,
    fontFamily: Font.medium,
    letterSpacing: 0.2,
  },
  headerTitle: {
    fontSize: FontSize.xxxl,
    fontFamily: Font.extraBold,
    color: Colors.textPrimary,
    letterSpacing: -1.2,
  },
  avatarCircle: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.accentLight,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 6,
  },
  monthRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: Spacing.lg,
  },
  monthText: {
    fontSize: FontSize.sm,
    color: Colors.textMuted,
    fontFamily: Font.medium,
  },

  // Stats
  statsGrid: { gap: 12, marginBottom: Spacing.xl },
  statsRow: { flexDirection: 'row', gap: 12 },

  // Earnings Card
  earningsWrapper: {
    borderRadius: Radius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.borderAccent,
    backgroundColor: Colors.glass,
    shadowColor: Colors.accent,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  earningsWrapperDue: {
    borderColor: 'rgba(255, 112, 67, 0.5)',
    shadowColor: '#FF7043',
  },
  earningsInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.lg,
  },
  earningsLabel: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    marginBottom: 4,
    fontFamily: Font.semiBold,
    letterSpacing: 0.2,
  },
  earningsValue: {
    fontSize: FontSize.xxxl,
    fontFamily: Font.extraBold,
    color: Colors.textPrimary,
    letterSpacing: -1.2,
  },
  earningsSubtitle: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    marginTop: 4,
    fontFamily: Font.regular,
  },
  earningsIcon: {
    width: 56,
    height: 56,
    borderRadius: Radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Section
  sectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: Spacing.md,
  },
  sectionAccent: {
    width: 4,
    height: 18,
    borderRadius: 2,
    backgroundColor: Colors.accentLight,
  },
  sectionTitle: {
    fontSize: FontSize.lg,
    fontFamily: Font.bold,
    color: Colors.textPrimary,
    letterSpacing: -0.3,
  },

  // Recent rows
  recentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: Radius.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.glass,
    padding: Spacing.md,
    marginBottom: 8,
  },
  recentAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  recentAvatarText: {
    color: '#fff',
    fontFamily: Font.bold,
    fontSize: FontSize.md,
  },
  recentName: {
    color: Colors.textPrimary,
    fontFamily: Font.semiBold,
    fontSize: FontSize.sm,
  },
  recentSubject: {
    color: Colors.textMuted,
    fontSize: FontSize.xs,
    fontFamily: Font.regular,
  },
  recentRate: {
    color: Colors.taught,
    fontSize: FontSize.sm,
    fontFamily: Font.semiBold,
  },

  // Empty
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
    gap: 12,
    overflow: 'hidden',
    borderRadius: Radius.xl,
  },
  emptyGlow: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    borderRadius: Radius.xl,
  },
  emptyTitle: {
    fontSize: FontSize.xl,
    fontFamily: Font.bold,
    color: Colors.textSecondary,
  },
  emptySubtitle: {
    fontSize: FontSize.sm,
    color: Colors.textMuted,
    textAlign: 'center',
    maxWidth: 260,
    lineHeight: 22,
    fontFamily: Font.regular,
  },
});
