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
import { getGoogleIdToken, GOOGLE_NATIVE_UNAVAILABLE } from '../../utils/googleSignin';
import { ScreenBackground } from '../../components/ScreenBackground';

export default function LoginScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { login, loginWithGoogle } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

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

  const handleLogin = async () => {
    if (!email.trim() || !password) {
      Alert.alert('Missing fields', 'Please enter your email and password.');
      return;
    }
    setLoading(true);
    try {
      await login(email.trim(), password);
      // _layout.tsx will redirect to dashboard automatically
    } catch (e: any) {
      const msg = e.code === 'auth/invalid-credential'
        ? 'Invalid email or password.'
        : e.message || 'Login failed.';
      Alert.alert('Login Failed', msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenBackground>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={[styles.scroll, { paddingTop: insets.top + 40, paddingBottom: insets.bottom + 40 }]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>

            {/* Logo / Brand */}
            <View style={styles.logoWrap}>
              <LinearGradient
                colors={[Colors.accentMid, Colors.accentLight]}
                style={styles.logoGradient}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
              >
                <Ionicons name="school" size={32} color="#fff" />
              </LinearGradient>
              <Text style={styles.appName}>TuitionTracker</Text>
              <Text style={styles.tagline}>Welcome back 👋</Text>
            </View>

            {/* Card */}
            <View style={styles.card}>
              <BlurView intensity={20} tint="dark" style={StyleSheet.absoluteFill} />
              <LinearGradient
                colors={['rgba(109,40,217,0.10)', 'transparent']}
                style={StyleSheet.absoluteFill}
              />

              <Text style={styles.cardTitle}>Sign In</Text>

              {/* Email */}
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

              {/* Password */}
              <View style={styles.inputWrap}>
                <Ionicons name="lock-closed-outline" size={18} color={Colors.textMuted} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Password"
                  placeholderTextColor={Colors.textMuted}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                />
                <TouchableOpacity onPress={() => setShowPassword(p => !p)} style={styles.eyeBtn}>
                  <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={18} color={Colors.textMuted} />
                </TouchableOpacity>
              </View>

              {/* Forgot Password */}
              <TouchableOpacity onPress={() => router.push('/auth/forgot')} style={styles.forgotBtn}>
                <Text style={styles.forgotText}>Forgot password?</Text>
              </TouchableOpacity>

              {/* Login Button */}
              <TouchableOpacity style={styles.submitBtn} onPress={handleLogin} disabled={loading} activeOpacity={0.85}>
                <LinearGradient
                  colors={[Colors.accentMid, Colors.accentLight]}
                  style={styles.submitGradient}
                  start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                >
                  {loading
                    ? <Text style={styles.submitText}>Signing in...</Text>
                    : <><Ionicons name="log-in-outline" size={20} color="#fff" /><Text style={styles.submitText}>Sign In</Text></>
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

              {/* Register Link */}
              <TouchableOpacity onPress={() => router.push('/auth/register')} style={styles.switchBtn}>
                <Text style={styles.switchText}>Don't have an account? </Text>
                <Text style={styles.switchLink}>Create one</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingHorizontal: Spacing.lg },
  logoWrap: { alignItems: 'center', marginBottom: 32 },
  logoGradient: { width: 72, height: 72, borderRadius: 22, alignItems: 'center', justifyContent: 'center', marginBottom: 14, shadowColor: Colors.accentLight, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.4, shadowRadius: 20, elevation: 10 },
  appName: { fontSize: FontSize.xxl, fontFamily: Font.extraBold, color: Colors.textPrimary, letterSpacing: -0.8 },
  tagline: { fontSize: FontSize.md, color: Colors.textMuted, fontFamily: Font.regular, marginTop: 4 },
  card: { borderRadius: Radius.xl, overflow: 'hidden', borderWidth: 1, borderColor: Colors.glassBorder, backgroundColor: 'rgba(255,255,255,0.04)', padding: Spacing.lg, gap: 14 },
  cardTitle: { fontSize: FontSize.xl, fontFamily: Font.bold, color: Colors.textPrimary, marginBottom: 4 },
  inputWrap: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: Radius.md, borderWidth: 1, borderColor: Colors.border, paddingHorizontal: Spacing.md, height: 52 },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, color: Colors.textPrimary, fontFamily: Font.regular, fontSize: FontSize.md },
  eyeBtn: { padding: 4 },
  forgotBtn: { alignSelf: 'flex-end', marginTop: -4 },
  forgotText: { color: Colors.accentLight, fontFamily: Font.medium, fontSize: FontSize.sm },
  submitBtn: { borderRadius: Radius.md, overflow: 'hidden', marginTop: 4 },
  submitGradient: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 15 },
  submitText: { color: '#fff', fontFamily: Font.bold, fontSize: FontSize.md },
  divider: { flexDirection: 'row', alignItems: 'center', gap: 12, marginVertical: 4 },
  dividerLine: { flex: 1, height: 1, backgroundColor: Colors.border },
  dividerText: { color: Colors.textMuted, fontFamily: Font.medium, fontSize: FontSize.xs },
  switchBtn: { flexDirection: 'row', justifyContent: 'center' },
  switchText: { color: Colors.textMuted, fontFamily: Font.regular, fontSize: FontSize.sm },
  switchLink: { color: Colors.accentLight, fontFamily: Font.semiBold, fontSize: FontSize.sm },
  googleBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: Radius.md, borderWidth: 1, borderColor: Colors.border, paddingVertical: 14, marginBottom: 4 },
  googleBtnText: { color: Colors.textPrimary, fontFamily: Font.semiBold, fontSize: FontSize.md },
});
