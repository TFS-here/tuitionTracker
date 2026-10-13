import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated as RNAnimated,
  Linking,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Student } from '../hooks/useStudents';
import {
  cyclesDue,
  currentCycleDays,
  amountDue,
  formatBDT,
  getWhatsAppNotificationUrl,
} from '../utils/attendance';
import { Colors, Font, FontSize, Radius, Spacing } from '../constants/theme';
import { APP_CONFIG, AVATAR_GRADIENTS } from '../constants/config';

const DAYS_PER_CYCLE = APP_CONFIG.DAYS_PER_CYCLE;

interface StudentCardProps {
  student: Student;
  onPress: () => void;
  onDelete: () => void;
  onMarkPaid: (studentId: string, amount: number) => void;
  index?: number;
}

export default function StudentCard({ student, onPress, onDelete, onMarkPaid, index = 0 }: StudentCardProps) {
  const scale = useRef(new RNAnimated.Value(1)).current;
  const glowAnim = useRef(new RNAnimated.Value(0)).current;
  const entranceAnim = useRef(new RNAnimated.Value(0)).current;

  const daysDone = currentCycleDays(student);
  const due = cyclesDue(student);
  const dueAmount = amountDue(student);
  const progressPct = DAYS_PER_CYCLE > 0 ? daysDone / DAYS_PER_CYCLE : 0;
  const isPaymentDue = due > 0;

  // Staggered entrance animation
  useEffect(() => {
    RNAnimated.spring(entranceAnim, {
      toValue: 1,
      delay: index * 60,
      useNativeDriver: true,
      damping: 16,
      stiffness: 120,
    }).start();
  }, []);

  // Continuous pulsing glow for overdue cards
  useEffect(() => {
    if (!isPaymentDue) return;
    const pulse = RNAnimated.loop(
      RNAnimated.sequence([
        RNAnimated.timing(glowAnim, { toValue: 1, duration: 1200, useNativeDriver: true }),
        RNAnimated.timing(glowAnim, { toValue: 0, duration: 1200, useNativeDriver: true }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, [isPaymentDue]);

  const handlePressIn = () =>
    RNAnimated.spring(scale, { toValue: 0.975, useNativeDriver: true, speed: 50 }).start();
  const handlePressOut = () =>
    RNAnimated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 30 }).start();

  const glowOpacity = glowAnim.interpolate({ inputRange: [0, 1], outputRange: [0.3, 0.7] });

  // Generate a consistent color from the student's initial
  const colorIdx = student.name.charCodeAt(0) % AVATAR_GRADIENTS.length;
  const [avatarFrom, avatarTo] = AVATAR_GRADIENTS[colorIdx];

  return (
    <RNAnimated.View
      style={[
        styles.wrapper,
        isPaymentDue && styles.wrapperDue,
        {
          transform: [
            { scale },
            { translateY: entranceAnim.interpolate({ inputRange: [0, 1], outputRange: [30, 0] }) },
          ],
          opacity: entranceAnim,
        },
      ]}
    >
      {/* Pulsing glow overlay for overdue state */}
      {isPaymentDue && (
        <RNAnimated.View style={[styles.dueGlow, { opacity: glowOpacity }]} />
      )}

      <TouchableOpacity
        activeOpacity={1}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={styles.touchable}
      >
        <BlurView intensity={18} tint="dark" style={StyleSheet.absoluteFill} />

        {/* Left accent bar */}
        <LinearGradient
          colors={isPaymentDue ? [Colors.dueOrange, Colors.cancelled] : [avatarFrom, avatarTo]}
          style={styles.accentBar}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
        />

        {/* Avatar with initial & unique color */}
        <LinearGradient
          colors={[avatarFrom, avatarTo]}
          style={styles.avatar}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Text style={styles.avatarText}>
            {student.name.charAt(0).toUpperCase()}
          </Text>
        </LinearGradient>

        {/* Info */}
        <View style={styles.info}>
          <Text style={styles.name} numberOfLines={1}>{student.name}</Text>
          <View style={styles.subjectPill}>
            <Text style={styles.subjectText}>{student.subject}</Text>
          </View>

          {/* Progress bar */}
          <View style={styles.progressRow}>
            <View style={styles.progressTrack}>
              <RNAnimated.View
                style={[
                  styles.progressFill,
                  { width: `${Math.min(progressPct * 100, 100)}%` },
                  isPaymentDue && styles.progressFillDue,
                ]}
              />
            </View>
            <Text style={styles.progressLabel}>
              {daysDone}<Text style={{ color: Colors.textDim }}>/{DAYS_PER_CYCLE}</Text>
            </Text>
          </View>

          {isPaymentDue ? (
            <Text style={styles.dueLabel}>
              💰 {due} month{due > 1 ? 's' : ''} due · {formatBDT(dueAmount)}
            </Text>
          ) : (
            <Text style={styles.meta}>
              {formatBDT(student.ratePerMonth)}/month
            </Text>
          )}
        </View>

        {/* Right side */}
        <View style={styles.right}>
          {isPaymentDue ? (
            <View style={styles.actionCol}>
              <TouchableOpacity
                style={styles.notifyBtn}
                onPress={() => {
                  const url = getWhatsAppNotificationUrl(student);
                  Linking.openURL(url).catch(() => alert('Make sure WhatsApp is installed!'));
                }}
                hitSlop={{ top: 4, bottom: 4, left: 4, right: 4 }}
              >
                <Ionicons name="logo-whatsapp" size={13} color="#25D366" />
                <Text style={styles.notifyBtnText}>Notify</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.payBtn}
                onPress={() => onMarkPaid(student.id, dueAmount)}
                hitSlop={{ top: 4, bottom: 4, left: 4, right: 4 }}
              >
                <Text style={styles.payBtnText}>Mark Paid</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.rateCol}>
              <Text style={styles.rate}>{formatBDT(student.ratePerMonth)}</Text>
              <Text style={styles.rateLabel}>/month</Text>
            </View>
          )}
          <TouchableOpacity
            onPress={onDelete}
            style={styles.deleteBtn}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="trash-outline" size={15} color={Colors.textDim} />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </RNAnimated.View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    borderRadius: Radius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    backgroundColor: 'rgba(255,255,255,0.04)',
    marginBottom: 10,
    shadowColor: Colors.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 14,
    elevation: 5,
  },
  wrapperDue: {
    borderColor: 'rgba(249,115,22,0.40)',
    shadowColor: '#F97316',
    shadowOpacity: 0.28,
    shadowRadius: 18,
  },
  dueGlow: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor: 'rgba(249,115,22,0.06)',
    zIndex: 0,
  },
  touchable: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingRight: Spacing.md,
    minHeight: 90,
  },
  accentBar: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 3,
  },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 14,
    marginRight: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  avatarText: {
    color: '#fff',
    fontSize: FontSize.lg,
    fontFamily: Font.extraBold,
  },
  info: {
    flex: 1,
    gap: 3,
  },
  name: {
    fontSize: FontSize.md,
    fontFamily: Font.semiBold,
    color: Colors.textPrimary,
    letterSpacing: 0.1,
  },
  subjectPill: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(167,139,250,0.12)',
    borderRadius: Radius.full,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderWidth: 1,
    borderColor: 'rgba(167,139,250,0.2)',
  },
  subjectText: {
    fontSize: 10,
    color: Colors.accentLight,
    fontFamily: Font.medium,
    letterSpacing: 0.3,
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 2,
  },
  progressTrack: {
    flex: 1,
    height: 3,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.07)',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
    backgroundColor: Colors.accentLight,
  },
  progressFillDue: {
    backgroundColor: Colors.dueOrange,
  },
  progressLabel: {
    fontSize: 10,
    color: Colors.accentLight,
    fontFamily: Font.bold,
    minWidth: 28,
  },
  meta: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    fontFamily: Font.regular,
  },
  dueLabel: {
    fontSize: FontSize.xs,
    color: Colors.dueOrange,
    fontFamily: Font.semiBold,
  },
  right: {
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: 6,
    minWidth: 80,
    alignSelf: 'stretch',
    paddingVertical: 4,
  },
  actionCol: {
    alignItems: 'flex-end',
    gap: 5,
  },
  rateCol: {
    alignItems: 'flex-end',
  },
  rate: {
    fontSize: FontSize.md,
    fontFamily: Font.bold,
    color: Colors.taught,
    letterSpacing: -0.3,
  },
  rateLabel: {
    fontSize: 10,
    color: Colors.textMuted,
    fontFamily: Font.regular,
  },
  notifyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(37,211,102,0.10)',
    borderRadius: Radius.sm,
    borderWidth: 1,
    borderColor: 'rgba(37,211,102,0.25)',
    paddingHorizontal: 7,
    paddingVertical: 4,
    gap: 4,
  },
  notifyBtnText: {
    color: '#25D366',
    fontFamily: Font.bold,
    fontSize: 10,
  },
  payBtn: {
    backgroundColor: 'rgba(249,115,22,0.15)',
    borderRadius: Radius.sm,
    borderWidth: 1,
    borderColor: 'rgba(249,115,22,0.35)',
    paddingHorizontal: 9,
    paddingVertical: 4,
  },
  payBtnText: {
    color: Colors.dueOrange,
    fontFamily: Font.bold,
    fontSize: 10,
  },
  deleteBtn: {
    padding: 4,
    marginTop: 2,
  },
});
