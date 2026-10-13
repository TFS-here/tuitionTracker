import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useStudents } from '../../hooks/useStudents';
import StudentCard from '../../components/StudentCard';
import AddStudentModal from '../../components/AddStudentModal';
import { Colors, FontSize, Radius, Spacing } from '../../constants/theme';
import { ScreenBackground } from '../../components/ScreenBackground';

export default function StudentsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { students, addStudent, deleteStudent, addPayment } = useStudents();
  const [modalVisible, setModalVisible] = useState(false);

  const handleDelete = useCallback(
    (id: string, name: string) => {
      Alert.alert(
        'Delete Student',
        `Are you sure you want to remove ${name}? All attendance records will be lost.`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: () => deleteStudent(id),
          },
        ]
      );
    },
    [deleteStudent]
  );

  const handlePress = useCallback(
    (id: string) => {
      router.push(`/attendance/${id}` as any);
    },
    [router]
  );

  const handleMarkPaid = useCallback(
    (studentId: string, amount: number) => {
      Alert.alert(
        'Mark as Paid',
        `Record a payment of ৳${amount.toLocaleString('en-BD')}?`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Confirm',
            onPress: () => addPayment(studentId, amount),
          },
        ]
      );
    },
    [addPayment]
  );

  const renderItem = useCallback(
    ({ item }: any) => (
      <StudentCard
        student={item}
        onPress={() => handlePress(item.id)}
        onDelete={() => handleDelete(item.id, item.name)}
        onMarkPaid={handleMarkPaid}
      />
    ),
    [handlePress, handleDelete, handleMarkPaid]
  );

  return (
    <ScreenBackground>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 20 }]}>
        <View>
          <Text style={styles.headerTitle}>Students</Text>
          <Text style={styles.headerSub}>
            {students.length} active tuition{students.length !== 1 ? 's' : ''}
          </Text>
        </View>
        <View style={styles.countBadge}>
          <Text style={styles.countText}>{students.length}</Text>
        </View>
      </View>

      {/* List */}
      <FlatList
        data={students}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={[
          styles.listContent,
          { paddingBottom: insets.bottom + 100 },
        ]}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={<EmptyStudents onAdd={() => setModalVisible(true)} />}
      />

      {/* FAB */}
      {students.length > 0 && (
        <TouchableOpacity
          onPress={() => setModalVisible(true)}
          style={[styles.fabWrapper, { bottom: insets.bottom + 80 }]}
          activeOpacity={0.85}
        >
          <LinearGradient
            colors={[Colors.accent, Colors.accentLight]}
            style={styles.fab}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Ionicons name="add" size={28} color="#fff" />
          </LinearGradient>
        </TouchableOpacity>
      )}

      {/* Modal */}
      <AddStudentModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onAdd={addStudent}
      />
    </ScreenBackground>
  );
}

function EmptyStudents({ onAdd }: { onAdd: () => void }) {
  return (
    <View style={styles.emptyWrap}>
      <Ionicons name="people-outline" size={64} color={Colors.textMuted} />
      <Text style={styles.emptyTitle}>No students yet</Text>
      <Text style={styles.emptySub}>
        Tap the + button to add your first tuition student.
      </Text>
      <TouchableOpacity onPress={onAdd} activeOpacity={0.8} style={styles.emptyBtnWrap}>
        <LinearGradient
          colors={[Colors.accent, Colors.accentLight]}
          style={styles.emptyBtn}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          <Ionicons name="add-circle-outline" size={18} color="#fff" />
          <Text style={styles.emptyBtnText}>Add First Student</Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  headerTitle: {
    fontSize: FontSize.xxxl,
    fontWeight: '800',
    color: Colors.textPrimary,
    letterSpacing: -1,
  },
  headerSub: {
    fontSize: FontSize.sm,
    color: Colors.textMuted,
    marginTop: 2,
  },
  countBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.accentGlow,
    borderWidth: 1,
    borderColor: Colors.borderAccent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  countText: {
    color: Colors.accentLight,
    fontWeight: '700',
    fontSize: FontSize.md,
  },

  listContent: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.sm,
  },

  fabWrapper: {
    position: 'absolute',
    right: Spacing.lg,
    borderRadius: Radius.full,
    shadowColor: Colors.accent,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 12,
  },
  fabTouchable: {
    borderRadius: Radius.full,
    overflow: 'hidden',
  },
  fab: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },

  emptyWrap: {
    alignItems: 'center',
    paddingTop: 80,
    gap: 12,
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: FontSize.xl,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  emptySub: {
    fontSize: FontSize.sm,
    color: Colors.textMuted,
    textAlign: 'center',
    lineHeight: 20,
  },
  emptyBtnWrap: {
    borderRadius: Radius.md,
    overflow: 'hidden',
    marginTop: 8,
  },
  emptyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  emptyBtnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: FontSize.md,
  },
});
