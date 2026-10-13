// ─── Design Tokens ────────────────────────────────────────────────────────────
export const Colors = {
  // Backgrounds — deeper, richer
  bg: '#070B18',
  bgCard: 'rgba(255,255,255,0.055)',
  bgCardHover: 'rgba(255,255,255,0.09)',

  // Glass surface — more refined
  glass: 'rgba(255,255,255,0.06)',
  glassBorder: 'rgba(255,255,255,0.10)',
  glassDark: 'rgba(7,11,24,0.80)',

  // Accent — Electric Violet (more vivid)
  accent: '#6D28D9',
  accentMid: '#7C3AED',
  accentLight: '#A78BFA',
  accentGlow: 'rgba(109,40,217,0.30)',
  accentGlowBright: 'rgba(167,139,250,0.20)',

  // Accent — Neon Blue
  blue: '#1D4ED8',
  blueLight: '#60A5FA',
  blueGlow: 'rgba(96,165,250,0.25)',

  // Semantic
  taught: '#10B981',
  taughtGlow: 'rgba(16,185,129,0.25)',
  skipped: '#F59E0B',
  skippedGlow: 'rgba(245,158,11,0.25)',
  cancelled: '#EF4444',
  cancelledGlow: 'rgba(239,68,68,0.25)',
  dueOrange: '#F97316',
  dueOrangeGlow: 'rgba(249,115,22,0.25)',

  // Text
  textPrimary: '#F8FAFC',
  textSecondary: '#94A3B8',
  textMuted: '#475569',
  textDim: '#334155',

  // Borders
  border: 'rgba(255,255,255,0.07)',
  borderAccent: 'rgba(124,58,237,0.35)',
  borderBright: 'rgba(167,139,250,0.25)',

  // Gradient stops
  gradientStart: '#070B18',
  gradientMid: '#0D1530',
  gradientEnd: '#070B18',
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const Radius = {
  sm: 8,
  md: 14,
  lg: 20,
  xl: 28,
  xxl: 36,
  full: 9999,
};

export const FontSize = {
  xs: 11,
  sm: 13,
  md: 15,
  lg: 18,
  xl: 22,
  xxl: 28,
  xxxl: 36,
};

// Font family references - Outfit (loaded in _layout.tsx)
export const Font = {
  regular: 'Outfit_400Regular',
  medium: 'Outfit_500Medium',
  semiBold: 'Outfit_600SemiBold',
  bold: 'Outfit_700Bold',
  extraBold: 'Outfit_800ExtraBold',
};

export const Shadow = {
  card: {
    shadowColor: '#6D28D9',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.22,
    shadowRadius: 24,
    elevation: 10,
  },
  glow: {
    shadowColor: '#A78BFA',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.45,
    shadowRadius: 20,
    elevation: 14,
  },
  greenGlow: {
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  orangeGlow: {
    shadowColor: '#F97316',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 8,
  },
};
