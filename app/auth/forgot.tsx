import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Animated,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../hooks/useAuth';
import { Colors, Font, FontSize, Radius, Spacing } from '../../constants/theme';
import { ScreenBackground } from '../../components/ScreenBackground';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { resetPassword } = useAuth();

  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, useNativeDriver: true, damping: 18, stiffness: 120 }),
    ]).start();
  }, []);

  const handleReset = async () => {
    if (!email.trim()) {
      Alert.alert('Missing field', 'Please enter your email.');
      return;
    }
    setLoading(true);
    try {
      await resetPassword(email.trim());
      setSent(true);
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Failed to send reset email.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenBackground>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView
          contentContainerStyle={[styles.scroll, { paddingTop: insets.top + 30, paddingBottom: insets.bottom + 40 }]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
            {/* Back */}
            <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
              <Ionicons name="arrow-back" size={22} color={Colors.textPrimary} />
            </TouchableOpacity>

            <View style={styles.header}>
              <LinearGradient colors={[Colors.accentMid, Colors.accentLight]} style={styles.logoGrad} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
                <Ionicons name={sent ? "checkmark-circle" : "key"} size={32} color="#fff" />
              </LinearGradient>
              <Text style={styles.title}>Reset Password</Text>
              <Text style={styles.subtitle}>
                {sent
                  ? 'Check your inbox for a link to reset your password.'
                  : "Enter your email and we'll send you a password reset link."}
              </Text>
            </View>

            {!sent && (
              <View style={styles.card}>
                <BlurView intensity={20} tint="dark" style={StyleSheet.absoluteFill} />
                <LinearGradient colors={['rgba(109,40,217,0.10)', 'transparent']} style={StyleSheet.absoluteFill} />

                <View style={styles.inputWrap}>
                  <Ionicons name="mail-outline" size={18} color={Colors.textMuted} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Email address"
                    placeholderTextColor={Colors.textMuted}
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                </View>

                <TouchableOpacity style={styles.submitBtn} onPress={handleReset} disabled={loading} activeOpacity={0.85}>
                  <LinearGradient colors={[Colors.accentMid, Colors.accentLight]} style={styles.submitGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
                    {loading
                      ? <Text style={styles.submitText}>Sending...</Text>
                      : <><Ionicons name="send" size={18} color="#fff" /><Text style={styles.submitText}>Send Reset Link</Text></>
                    }
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            )}

            {sent && (
              <TouchableOpacity onPress={() => router.push('/auth/login')} style={styles.switchBtn}>
                <Text style={styles.switchLink}>Back to Sign In</Text>
              </TouchableOpacity>
            )}
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingHorizontal: Spacing.lg },
  backBtn: { width: 40, height: 40, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.07)', borderWidth: 1, borderColor: Colors.border, alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.lg },
  header: { alignItems: 'center', marginBottom: 28 },
  logoGrad: { width: 72, height: 72, borderRadius: 22, alignItems: 'center', justifyContent: 'center', marginBottom: 14, shadowColor: Colors.accentLight, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.4, shadowRadius: 16, elevation: 8 },
  title: { fontSize: FontSize.xxl, fontFamily: Font.extraBold, color: Colors.textPrimary, letterSpacing: -0.8 },
  subtitle: { fontSize: FontSize.sm, color: Colors.textMuted, fontFamily: Font.regular, marginTop: 6, textAlign: 'center', lineHeight: 20, paddingHorizontal: 20 },
  card: { borderRadius: Radius.xl, overflow: 'hidden', borderWidth: 1, borderColor: Colors.glassBorder, backgroundColor: 'rgba(255,255,255,0.04)', padding: Spacing.lg, gap: 14 },
  inputWrap: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: Radius.md, borderWidth: 1, borderColor: Colors.border, paddingHorizontal: Spacing.md, height: 52 },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, color: Colors.textPrimary, fontFamily: Font.regular, fontSize: FontSize.md },
  submitBtn: { borderRadius: Radius.md, overflow: 'hidden', marginTop: 4 },
  submitGradient: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 15 },
  submitText: { color: '#fff', fontFamily: Font.bold, fontSize: FontSize.md },
  switchBtn: { flexDirection: 'row', justifyContent: 'center', marginTop: 20 },
  switchLink: { color: Colors.accentLight, fontFamily: Font.semiBold, fontSize: FontSize.sm },
});
