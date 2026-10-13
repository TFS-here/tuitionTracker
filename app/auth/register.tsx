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
import { generateOTP, storeOTP, verifyOTP, sendOTPEmail } from '../../utils/otp';
import { Colors, Font, FontSize, Radius, Spacing } from '../../constants/theme';
import { getGoogleIdToken, GOOGLE_NATIVE_UNAVAILABLE } from '../../utils/googleSignin';
import { useAuth } from '../../hooks/useAuth';
import { ScreenBackground } from '../../components/ScreenBackground';

type Step = 'form' | 'otp';

export default function RegisterScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { register, loginWithGoogle } = useAuth();

  const [step, setStep] = useState<Step>('form');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, useNativeDriver: true, damping: 18, stiffness: 120 }),
    ]).start();
  }, []);

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      const idToken = await getGoogleIdToken();
      await loginWithGoogle(idToken);
    } catch (e: any) {
      if (e?.message === GOOGLE_NATIVE_UNAVAILABLE) {
        Alert.alert(
          'Expo Go Notice',
          'Google Sign-In requires native Android libraries that are not supported in Expo Go.\n\n👉 Please use your Email and Password while testing in Expo Go.\n\nTo test Google Sign-In, create a development build with `npx expo run:android`.'
        );
      } else {
        console.error(e);
        Alert.alert('Google Login Failed', e.message || 'An unknown error occurred.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Cooldown countdown
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const t = setTimeout(() => setResendCooldown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [resendCooldown]);

  const sendOtp = async () => {
    const otp = generateOTP();
    storeOTP(email.trim(), otp);
    await sendOTPEmail(email.trim(), name.trim(), otp);
    setResendCooldown(60);
  };

  const handleSendOTP = async () => {
    if (!name.trim() || !email.trim() || !password || !confirmPassword) {
      Alert.alert('Missing fields', 'Please fill in all fields.'); return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Password Mismatch', 'Passwords do not match.'); return;
    }
    if (password.length < 6) {
      Alert.alert('Weak Password', 'Password must be at least 6 characters.'); return;
    }
    setLoading(true);
    try {
      await sendOtp();
      setStep('otp');
    } catch (e: any) {
      console.log('EmailJS Full Error:', e);
      Alert.alert('Failed to Send OTP', e?.text || e?.message || JSON.stringify(e));
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (otpCode.length !== 6) {
      Alert.alert('Invalid Code', 'Please enter the 6-digit code sent to your email.'); return;
    }
    const isValid = verifyOTP(email.trim(), otpCode);
    if (!isValid) {
      Alert.alert('Incorrect Code', 'The code is wrong or has expired. Please try again.'); return;
    }
    setLoading(true);
    try {
      await register(name.trim(), email.trim(), password);
    } catch (e: any) {
      const msg = e.code === 'auth/email-already-in-use'
        ? 'This email is already registered.'
        : e.message || 'Registration failed.';
      Alert.alert('Error', msg);
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
            <TouchableOpacity onPress={() => step === 'otp' ? setStep('form') : router.back()} style={styles.backBtn}>
              <Ionicons name="arrow-back" size={22} color={Colors.textPrimary} />
            </TouchableOpacity>

            {/* Header */}
            <View style={styles.header}>
              <LinearGradient colors={[Colors.accentMid, Colors.accentLight]} style={styles.logoGrad} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
                <Ionicons name={step === 'otp' ? 'mail' : 'person-add'} size={28} color="#fff" />
              </LinearGradient>
              <Text style={styles.title}>{step === 'otp' ? 'Verify Email' : 'Create Account'}</Text>
              <Text style={styles.subtitle}>
                {step === 'otp'
                  ? `We sent a 6-digit code to\n${email}`
                  : 'Start tracking your tuitions today'}
              </Text>
            </View>

            {/* Form Card */}
            <View style={styles.card}>
              <BlurView intensity={20} tint="dark" style={StyleSheet.absoluteFill} />
              <LinearGradient colors={['rgba(109,40,217,0.10)', 'transparent']} style={StyleSheet.absoluteFill} />

              {step === 'form' ? (
                <>
                  {/* Name */}
                  <View style={styles.inputWrap}>
                    <Ionicons name="person-outline" size={18} color={Colors.textMuted} style={styles.inputIcon} />
                    <TextInput style={styles.input} placeholder="Full Name" placeholderTextColor={Colors.textMuted} value={name} onChangeText={setName} autoCapitalize="words" />
                  </View>

                  {/* Email */}
                  <View style={styles.inputWrap}>
                    <Ionicons name="mail-outline" size={18} color={Colors.textMuted} style={styles.inputIcon} />
                    <TextInput style={styles.input} placeholder="Email address" placeholderTextColor={Colors.textMuted} value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" autoCorrect={false} />
                  </View>

                  {/* Password */}
                  <View style={styles.inputWrap}>
                    <Ionicons name="lock-closed-outline" size={18} color={Colors.textMuted} style={styles.inputIcon} />
                    <TextInput style={styles.input} placeholder="Password (min 6 chars)" placeholderTextColor={Colors.textMuted} value={password} onChangeText={setPassword} secureTextEntry={!showPassword} />
                    <TouchableOpacity onPress={() => setShowPassword(p => !p)} style={styles.eyeBtn}>
                      <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={18} color={Colors.textMuted} />
                    </TouchableOpacity>
                  </View>

                  {/* Confirm Password */}
                  <View style={styles.inputWrap}>
                    <Ionicons name="lock-closed-outline" size={18} color={Colors.textMuted} style={styles.inputIcon} />
                    <TextInput style={styles.input} placeholder="Confirm Password" placeholderTextColor={Colors.textMuted} value={confirmPassword} onChangeText={setConfirmPassword} secureTextEntry={!showPassword} />
                  </View>

                  <TouchableOpacity style={styles.submitBtn} onPress={handleSendOTP} disabled={loading} activeOpacity={0.85}>
                    <LinearGradient colors={[Colors.accentMid, Colors.accentLight]} style={styles.submitGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
                      {loading
                        ? <Text style={styles.submitText}>Sending OTP...</Text>
                        : <><Ionicons name="send" size={18} color="#fff" /><Text style={styles.submitText}>Send Verification Code</Text></>
                      }
                    </LinearGradient>
                  </TouchableOpacity>

                  {/* Divider */}
                  <View style={styles.divider}>
                    <View style={styles.dividerLine} />
                    <Text style={styles.dividerText}>OR</Text>
                    <View style={styles.dividerLine} />
                  </View>

                  {/* Google Button */}
                  <TouchableOpacity
                    style={styles.googleBtn}
                    disabled={loading}
                    onPress={handleGoogleLogin}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="logo-google" size={18} color={Colors.textPrimary} />
                    <Text style={styles.googleBtnText}>Continue with Google</Text>
                  </TouchableOpacity>
                </>
              ) : (
                <>
                  {/* OTP Input */}
                  <View style={styles.otpContainer}>
                    <TextInput
                      style={styles.otpInput}
                      value={otpCode}
                      onChangeText={v => setOtpCode(v.replace(/[^0-9]/g, '').slice(0, 6))}
                      keyboardType="number-pad"
                      maxLength={6}
                      placeholder="000000"
                      placeholderTextColor={Colors.textDim}
                      textAlign="center"
                      autoFocus
                    />
                    <Text style={styles.otpHint}>Check your Gmail inbox (and spam folder)</Text>
                  </View>

                  <TouchableOpacity style={styles.submitBtn} onPress={handleVerifyOTP} disabled={loading} activeOpacity={0.85}>
                    <LinearGradient colors={[Colors.taught, '#34D399']} style={styles.submitGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
                      {loading
                        ? <Text style={styles.submitText}>Creating account...</Text>
                        : <><Ionicons name="checkmark-circle" size={20} color="#fff" /><Text style={styles.submitText}>Verify & Create Account</Text></>
                      }
                    </LinearGradient>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={async () => { await sendOtp(); Alert.alert('Sent!', 'A new code has been sent to your email.'); }}
                    disabled={resendCooldown > 0}
                    style={styles.resendBtn}
                  >
                    <Text style={[styles.resendText, resendCooldown > 0 && { color: Colors.textMuted }]}>
                      {resendCooldown > 0 ? `Resend code in ${resendCooldown}s` : 'Resend Code'}
                    </Text>
                  </TouchableOpacity>
                </>
              )}
            </View>

            {/* Switch to Login */}
            {step === 'form' && (
              <TouchableOpacity onPress={() => router.push('/auth/login')} style={styles.switchBtn}>
                <Text style={styles.switchText}>Already have an account? </Text>
                <Text style={styles.switchLink}>Sign In</Text>
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
  logoGrad: { width: 64, height: 64, borderRadius: 20, alignItems: 'center', justifyContent: 'center', marginBottom: 14, shadowColor: Colors.accentLight, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.4, shadowRadius: 16, elevation: 8 },
  title: { fontSize: FontSize.xxl, fontFamily: Font.extraBold, color: Colors.textPrimary, letterSpacing: -0.8 },
  subtitle: { fontSize: FontSize.sm, color: Colors.textMuted, fontFamily: Font.regular, marginTop: 6, textAlign: 'center', lineHeight: 20 },
  card: { borderRadius: Radius.xl, overflow: 'hidden', borderWidth: 1, borderColor: Colors.glassBorder, backgroundColor: 'rgba(255,255,255,0.04)', padding: Spacing.lg, gap: 14 },
  inputWrap: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: Radius.md, borderWidth: 1, borderColor: Colors.border, paddingHorizontal: Spacing.md, height: 52 },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, color: Colors.textPrimary, fontFamily: Font.regular, fontSize: FontSize.md },
  eyeBtn: { padding: 4 },
  submitBtn: { borderRadius: Radius.md, overflow: 'hidden', marginTop: 4 },
  submitGradient: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 15 },
  submitText: { color: '#fff', fontFamily: Font.bold, fontSize: FontSize.md },
  otpContainer: { alignItems: 'center', gap: 12, paddingVertical: 8 },
  otpInput: { fontSize: 40, fontFamily: Font.extraBold, color: Colors.textPrimary, letterSpacing: 12, backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: Radius.md, borderWidth: 1, borderColor: Colors.borderBright, paddingHorizontal: 20, paddingVertical: 16, width: '100%' },
  otpHint: { fontSize: FontSize.xs, color: Colors.textMuted, fontFamily: Font.regular, textAlign: 'center' },
  resendBtn: { alignItems: 'center', paddingVertical: 4 },
  resendText: { color: Colors.accentLight, fontFamily: Font.medium, fontSize: FontSize.sm },
  switchBtn: { flexDirection: 'row', justifyContent: 'center', marginTop: 20 },
  switchText: { color: Colors.textMuted, fontFamily: Font.regular, fontSize: FontSize.sm },
  switchLink: { color: Colors.accentLight, fontFamily: Font.semiBold, fontSize: FontSize.sm },
  divider: { flexDirection: 'row', alignItems: 'center', gap: 12, marginVertical: 8 },
  dividerLine: { flex: 1, height: 1, backgroundColor: Colors.border },
  dividerText: { color: Colors.textMuted, fontFamily: Font.medium, fontSize: FontSize.xs },
  googleBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: Radius.md, borderWidth: 1, borderColor: Colors.border, paddingVertical: 14, marginBottom: 4 },
  googleBtnText: { color: Colors.textPrimary, fontFamily: Font.semiBold, fontSize: FontSize.md },
});
