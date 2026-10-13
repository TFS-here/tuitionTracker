import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Animated, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../hooks/useAuth';
import { Colors, Font, FontSize, Radius, Spacing } from '../../constants/theme';
import { useRouter } from 'expo-router';
import { ScreenBackground } from '../../components/ScreenBackground';

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const { user, logout } = useAuth();
  const router = useRouter();

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, useNativeDriver: true, damping: 20, stiffness: 100 }),
    ]).start();
  }, []);

  const handleLogout = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          await logout();
          // The RootLayout will automatically intercept the auth state change and redirect
        },
      },
    ]);
  };

  const initial = user?.displayName ? user.displayName.charAt(0).toUpperCase() : 'T';
  const name = user?.displayName || 'Tutor';
  const email = user?.email || 'Not logged in';

  return (
    <ScreenBackground>
      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          { paddingTop: insets.top + 20, paddingBottom: insets.bottom + 100 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
          
          {/* Header */}
          <Text style={styles.headerTitle}>Profile</Text>

          {/* Profile Card */}
          <View style={styles.profileCard}>
            <BlurView intensity={20} tint="dark" style={StyleSheet.absoluteFill} />
            <LinearGradient
              colors={['rgba(255,255,255,0.08)', 'rgba(255,255,255,0.01)']}
              style={StyleSheet.absoluteFill}
            />

            <View style={styles.profileInfo}>
              <LinearGradient
                colors={[Colors.accentMid, Colors.accentLight]}
                style={styles.avatarLarge}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Text style={styles.avatarTextLarge}>{initial}</Text>
              </LinearGradient>

              <View style={styles.nameWrap}>
                <Text style={styles.name}>{name}</Text>
                <Text style={styles.email}>{email}</Text>
              </View>
            </View>

            {/* Logout Button */}
            <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} activeOpacity={0.8}>
              <LinearGradient
                colors={['#EF4444', '#DC2626']}
                style={styles.logoutGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Ionicons name="log-out-outline" size={20} color="#fff" />
                <Text style={styles.logoutText}>Sign Out</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </ScrollView>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingHorizontal: Spacing.lg },

  headerTitle: {
    fontSize: FontSize.xxxl,
    fontFamily: Font.extraBold,
    color: Colors.textPrimary,
    letterSpacing: -1.2,
    marginBottom: Spacing.xl,
  },

  profileCard: {
    borderRadius: Radius.xl,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    padding: Spacing.xl,
    gap: 30,
  },
  profileInfo: {
    alignItems: 'center',
    gap: 16,
  },
  avatarLarge: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.accentLight,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
  },
  avatarTextLarge: {
    color: '#fff',
    fontFamily: Font.extraBold,
    fontSize: 40,
  },
  nameWrap: {
    alignItems: 'center',
    gap: 4,
  },
  name: {
    fontSize: FontSize.xxl,
    fontFamily: Font.bold,
    color: Colors.textPrimary,
  },
  email: {
    fontSize: FontSize.md,
    fontFamily: Font.regular,
    color: Colors.textMuted,
  },

  logoutBtn: {
    borderRadius: Radius.md,
    overflow: 'hidden',
  },
  logoutGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
  },
  logoutText: {
    color: '#fff',
    fontFamily: Font.bold,
    fontSize: FontSize.md,
  },
});
