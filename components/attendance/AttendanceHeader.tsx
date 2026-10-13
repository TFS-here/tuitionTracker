import React, { memo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { Student } from '../../services/studentRepository';
import { Colors, FontSize, Radius, Spacing } from '../../constants/theme';
import { AVATAR_GRADIENTS } from '../../constants/config';

interface AttendanceHeaderProps {
  student: Student;
  topInset: number;
  onBack: () => void;
}

function AttendanceHeaderComponent({ student, topInset, onBack }: AttendanceHeaderProps) {
  const colorIdx = student.name.charCodeAt(0) % AVATAR_GRADIENTS.length;
  const avatarColors = AVATAR_GRADIENTS[colorIdx];

  return (
    <View style={[styles.header, { paddingTop: topInset + 8 }]}>
      <TouchableOpacity onPress={onBack} style={styles.backButton} activeOpacity={0.7}>
        <BlurView intensity={25} tint="dark" style={StyleSheet.absoluteFill} />
        <Ionicons name="arrow-back" size={22} color={Colors.textPrimary} />
      </TouchableOpacity>

      <View style={styles.headerInfo}>
        <Text style={styles.studentName} numberOfLines={1}>
          {student.name}
        </Text>
        <View style={styles.subjectPill}>
          <Text style={styles.subjectText}>{student.subject}</Text>
        </View>
      </View>

      <LinearGradient
        colors={avatarColors}
        style={styles.headerAvatar}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <Text style={styles.avatarText}>{student.name.charAt(0).toUpperCase()}</Text>
      </LinearGradient>
    </View>
  );
}

export const AttendanceHeader = memo(AttendanceHeaderComponent);

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.md,
    gap: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  headerInfo: { flex: 1 },
  studentName: {
    fontSize: FontSize.xl,
    fontWeight: '800',
    color: Colors.textPrimary,
    letterSpacing: -0.5,
  },
  subjectPill: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.accentGlow,
    borderRadius: Radius.full,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginTop: 2,
  },
  subjectText: {
    fontSize: FontSize.xs,
    color: Colors.accentLight,
    fontWeight: '500',
  },
  headerAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: FontSize.lg,
  },
});
