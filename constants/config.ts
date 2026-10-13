/**
 * Global App Configuration & Business Constants
 */

export const APP_CONFIG = {
  /** Number of taught days that constitute one billing cycle / monthly rate */
  DAYS_PER_CYCLE: 12,
  /** Maximum recent students shown on the dashboard */
  MAX_RECENT_STUDENTS: 4,
} as const;

/** Shared palette for generating deterministic student avatar gradients */
export const AVATAR_GRADIENTS: [string, string][] = [
  ['#6D28D9', '#A78BFA'],
  ['#1D4ED8', '#60A5FA'],
  ['#065F46', '#10B981'],
  ['#92400E', '#F59E0B'],
  ['#831843', '#EC4899'],
  ['#1E3A5F', '#38BDF8'],
];
