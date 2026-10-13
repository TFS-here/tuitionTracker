import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Calendar, DateData } from 'react-native-calendars';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useStudents } from '../../hooks/useStudents';
import {
  cycleStatus,
  totalTaughtAllTime,
  currentCycleDays,
  cyclesDue,
  amountDue,
  countThisMonth,
} from '../../utils/attendance';
import { Colors, Radius, Spacing } from '../../constants/theme';
import { ScreenBackground } from '../../components/ScreenBackground';
import { AttendanceHeader } from '../../components/attendance/AttendanceHeader';
import { AttendanceStats } from '../../components/attendance/AttendanceStats';
import { AttendanceLegend } from '../../components/attendance/AttendanceLegend';
import { CycleProgressCard } from '../../components/attendance/CycleProgressCard';
import { ToastNotification } from '../../components/attendance/ToastNotification';

const STATUS_CONFIG = {
  taught: {
    label: 'Taught',
    color: Colors.taught,
    glow: Colors.taughtGlow,
    icon: 'checkmark-circle' as const,
    dotColor: Colors.taught,
    selected: true,
    selectedColor: Colors.taught,
  },
  skipped: {
    label: 'Skipped',
    color: Colors.skipped,
    glow: Colors.skippedGlow,
    icon: 'time' as const,
    dotColor: Colors.skipped,
    selected: true,
    selectedColor: Colors.skipped,
  },
  cancelled: {
    label: 'Cancelled',
    color: Colors.cancelled,
    glow: Colors.cancelledGlow,
    icon: 'close-circle' as const,
    dotColor: Colors.cancelled,
    selected: true,
    selectedColor: Colors.cancelled,
  },
};

const calendarTheme = {
  backgroundColor: 'transparent',
  calendarBackground: 'transparent',
  textSectionTitleColor: Colors.textMuted,
  selectedDayBackgroundColor: Colors.accent,
  selectedDayTextColor: '#ffffff',
  todayTextColor: Colors.accentLight,
  dayTextColor: Colors.textPrimary,
  textDisabledColor: Colors.textMuted,
  dotColor: Colors.taught,
  selectedDotColor: '#ffffff',
  arrowColor: Colors.accentLight,
  monthTextColor: Colors.textPrimary,
  indicatorColor: Colors.accentLight,
  textDayFontWeight: '500' as const,
  textMonthFontWeight: '700' as const,
  textDayHeaderFontWeight: '600' as const,
  textDayFontSize: 14,
  textMonthFontSize: 16,
  textDayHeaderFontSize: 12,
};

export default function AttendanceScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getStudent, updateAttendance, loading } = useStudents();

  const student = getStudent(id);

  // Animations
  const slideAnim = useRef(new Animated.Value(40)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const feedbackScale = useRef(new Animated.Value(1)).current;
  const toastAnim = useRef(new Animated.Value(100)).current;
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    Animated.parallel([
      Animated.spring(slideAnim, { toValue: 0, useNativeDriver: true, damping: 18, stiffness: 130 }),
      Animated.timing(opacityAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
    ]).start();
  }, [opacityAnim, slideAnim]);

  const handleDayPress = useCallback(
    (day: DateData) => {
      if (!student) return;
      const dateStr = day.dateString;
      const current = student.attendance[dateStr];
      const next = cycleStatus(current);

      // Bounce feedback animation
      Animated.sequence([
        Animated.spring(feedbackScale, { toValue: 0.95, useNativeDriver: true, speed: 50 }),
        Animated.spring(feedbackScale, { toValue: 1, useNativeDriver: true, speed: 30 }),
      ]).start();

      updateAttendance(id, dateStr, next);

      // Trigger animated toast
      const label = next ? STATUS_CONFIG[next].label : 'Cleared';
      setToastMessage(`Marked as ${label}`);
      toastAnim.stopAnimation();
      toastAnim.setValue(100);
      Animated.sequence([
        Animated.spring(toastAnim, { toValue: 0, useNativeDriver: true, speed: 20, bounciness: 12 }),
        Animated.delay(2000),
        Animated.timing(toastAnim, { toValue: 100, duration: 300, useNativeDriver: true }),
      ]).start();
    },
    [student, id, updateAttendance, toastAnim, feedbackScale]
  );

  // Build marked dates for calendar (memoized)
  const markedDates = useMemo(() => {
    if (!student) return {};
    const marks: Record<string, any> = {};
    for (const [date, status] of Object.entries(student.attendance)) {
      const cfg = STATUS_CONFIG[status];
      if (!cfg) continue;
      marks[date] = {
        selected: true,
        selectedColor: cfg.selectedColor + '33',
        dotColor: cfg.dotColor,
        marked: true,
        customStyles: {
          container: {
            backgroundColor: cfg.selectedColor + '28',
            borderRadius: 8,
            borderWidth: 1.5,
            borderColor: cfg.selectedColor,
          },
          text: { color: cfg.color, fontWeight: '700' },
        },
      };
    }
    return marks;
  }, [student]);

  if (loading) {
    return (
      <ScreenBackground style={styles.notFound}>
        <View style={styles.loadingDot} />
        <Text style={styles.notFoundText}>Loading...</Text>
      </ScreenBackground>
    );
  }

  if (!student) {
    return (
      <ScreenBackground style={styles.notFound}>
        <Ionicons name="alert-circle-outline" size={48} color={Colors.textMuted} />
        <Text style={styles.notFoundText}>Student not found</Text>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backBtnText}>Go Back</Text>
        </TouchableOpacity>
      </ScreenBackground>
    );
  }

  // Calculated stats
  const taughtAllTime = totalTaughtAllTime(student.attendance);
  const cycleDays = currentCycleDays(student);
  const monthsDue = cyclesDue(student);
  const totalDue = amountDue(student);
  const taughtThisMonth = countThisMonth(student.attendance, 'taught');
  const skippedThisMonth = countThisMonth(student.attendance, 'skipped');
  const cancelledThisMonth = countThisMonth(student.attendance, 'cancelled');
  const earningsThisMonth = taughtThisMonth * (student.ratePerMonth / 12);

  return (
    <ScreenBackground>
      <AttendanceHeader
        student={student}
        topInset={insets.top}
        onBack={() => router.back()}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 100 }]}
      >
        <Animated.View
          style={{ opacity: opacityAnim, transform: [{ translateY: slideAnim }] }}
        >
          <AttendanceStats
            taughtCount={taughtThisMonth}
            skippedCount={skippedThisMonth}
            cancelledCount={cancelledThisMonth}
            earningsThisMonth={earningsThisMonth}
          />

          <Animated.View
            style={[
              styles.calendarWrapper,
              { transform: [{ scale: feedbackScale }] },
            ]}
          >
            <BlurView intensity={22} tint="dark" style={StyleSheet.absoluteFill} />
            <LinearGradient
              colors={['rgba(124,58,237,0.10)', 'transparent']}
              style={StyleSheet.absoluteFill}
            />
            <Calendar
              markingType="custom"
              markedDates={markedDates}
              onDayPress={handleDayPress}
              theme={calendarTheme}
              style={styles.calendar}
              enableSwipeMonths
            />
          </Animated.View>

          <AttendanceLegend statusConfigs={STATUS_CONFIG} />

          <CycleProgressCard
            cycleDays={cycleDays}
            ratePerMonth={student.ratePerMonth}
            monthsDue={monthsDue}
            totalDue={totalDue}
            taughtAllTime={taughtAllTime}
          />
        </Animated.View>
      </ScrollView>

      <ToastNotification
        message={toastMessage}
        bottomInset={insets.bottom}
        translateY={toastAnim}
      />
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  scroll: {
    paddingHorizontal: Spacing.md,
    paddingTop: 8,
  },
  calendarWrapper: {
    borderRadius: Radius.xl,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    backgroundColor: Colors.glass,
    marginBottom: Spacing.md,
    shadowColor: Colors.accent,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  calendar: {
    backgroundColor: 'transparent',
    paddingBottom: 8,
  },
  notFound: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  loadingDot: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 3,
    borderColor: Colors.accentLight,
    borderTopColor: 'transparent',
  },
  notFoundText: {
    fontSize: 16,
    color: Colors.textMuted,
  },
  backBtn: {
    marginTop: 8,
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  backBtnText: {
    color: Colors.textSecondary,
    fontSize: 15,
  },
});
