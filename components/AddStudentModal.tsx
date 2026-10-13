import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import GlassModal from './GlassModal';
import { Colors, FontSize, Radius, Spacing } from '../constants/theme';

interface AddStudentModalProps {
  visible: boolean;
  onClose: () => void;
  onAdd: (name: string, subject: string, rate: number, phone?: string) => void;
}

export default function AddStudentModal({
  visible,
  onClose,
  onAdd,
}: AddStudentModalProps) {
  const [name, setName] = useState('');
  const [subject, setSubject] = useState('');
  const [rate, setRate] = useState('');
  const [phone, setPhone] = useState('');
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const handleAdd = () => {
    const trimmedName = name.trim();
    const trimmedSubject = subject.trim();
    const parsedRate = parseFloat(rate);

    if (!trimmedName) {
      Alert.alert('Missing Info', 'Please enter student name.');
      return;
    }
    if (!trimmedSubject) {
      Alert.alert('Missing Info', 'Please enter the subject.');
      return;
    }
    if (isNaN(parsedRate) || parsedRate <= 0) {
      Alert.alert('Invalid Rate', 'Please enter a valid monthly rate.');
      return;
    }

    onAdd(trimmedName, trimmedSubject, parsedRate, phone.trim());
    setName('');
    setSubject('');
    setRate('');
    setPhone('');
    onClose();
  };

  return (
    <GlassModal visible={visible} onClose={onClose}>
      {/* Header */}
      <View style={styles.header}>
        <LinearGradient
          colors={[Colors.accent, Colors.accentLight]}
          style={styles.headerIcon}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Ionicons name="person-add" size={20} color="#fff" />
        </LinearGradient>
        <View>
          <Text style={styles.title}>Add New Student</Text>
          <Text style={styles.subtitle}>Fill in tuition details</Text>
        </View>
      </View>

      {/* Fields */}
      <View style={styles.fields}>
        <FieldLabel label="Student Name" icon="person-outline" />
        <TextInput
          style={[styles.input, focusedField === 'name' && styles.inputFocused]}
          placeholder="e.g. Rahim Hossain"
          placeholderTextColor={Colors.textMuted}
          value={name}
          onChangeText={setName}
          onFocus={() => setFocusedField('name')}
          onBlur={() => setFocusedField(null)}
          autoCapitalize="words"
        />

        <FieldLabel label="Subject" icon="book-outline" />
        <TextInput
          style={[styles.input, focusedField === 'subject' && styles.inputFocused]}
          placeholder="e.g. Mathematics"
          placeholderTextColor={Colors.textMuted}
          value={subject}
          onChangeText={setSubject}
          onFocus={() => setFocusedField('subject')}
          onBlur={() => setFocusedField(null)}
          autoCapitalize="words"
        />

        <FieldLabel label="Monthly Rate (৳)" icon="cash-outline" />
        <TextInput
          style={[styles.input, focusedField === 'rate' && styles.inputFocused]}
          placeholder="e.g. 3000"
          placeholderTextColor={Colors.textMuted}
          value={rate}
          onChangeText={setRate}
          onFocus={() => setFocusedField('rate')}
          onBlur={() => setFocusedField(null)}
          keyboardType="numeric"
        />

        <FieldLabel label="Phone Number (Optional)" icon="call-outline" />
        <TextInput
          style={[styles.input, focusedField === 'phone' && styles.inputFocused]}
          placeholder="e.g. 01712345678"
          placeholderTextColor={Colors.textMuted}
          value={phone}
          onChangeText={setPhone}
          onFocus={() => setFocusedField('phone')}
          onBlur={() => setFocusedField(null)}
          keyboardType="phone-pad"
        />
      </View>

      {/* Action Buttons */}
      <View style={styles.actions}>
        <TouchableOpacity style={styles.cancelBtn} onPress={onClose} activeOpacity={0.7}>
          <Text style={styles.cancelText}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleAdd} activeOpacity={0.85} style={styles.addBtnWrapper}>
          <LinearGradient
            colors={[Colors.accent, Colors.accentLight]}
            style={styles.addBtn}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Ionicons name="checkmark" size={18} color="#fff" />
            <Text style={styles.addBtnText}>Add Student</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </GlassModal>
  );
}

function FieldLabel({ label, icon }: { label: string; icon: keyof typeof Ionicons.glyphMap }) {
  return (
    <View style={styles.label}>
      <Ionicons name={icon} size={13} color={Colors.textMuted} />
      <Text style={styles.labelText}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: Spacing.lg,
    paddingTop: 8,
  },
  headerIcon: {
    width: 44,
    height: 44,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: FontSize.lg,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  subtitle: {
    fontSize: FontSize.sm,
    color: Colors.textMuted,
    marginTop: 1,
  },
  fields: {
    gap: 6,
    marginBottom: Spacing.lg,
  },
  label: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: 4,
    marginTop: 10,
  },
  labelText: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  input: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.md,
    paddingVertical: 13,
    color: Colors.textPrimary,
    fontSize: FontSize.md,
  },
  inputFocused: {
    borderColor: Colors.accentLight,
    backgroundColor: 'rgba(124,58,237,0.08)',
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 4,
    paddingBottom: 8,
  },
  cancelBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  cancelText: {
    color: Colors.textSecondary,
    fontSize: FontSize.md,
    fontWeight: '500',
  },
  addBtnWrapper: {
    flex: 2,
    borderRadius: Radius.md,
    overflow: 'hidden',
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
  },
  addBtnText: {
    color: '#fff',
    fontSize: FontSize.md,
    fontWeight: '700',
  },
});
