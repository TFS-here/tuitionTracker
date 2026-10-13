import { Student, AttendanceStatus } from '../services/studentRepository';
import { APP_CONFIG } from '../constants/config';

export const DAYS_PER_CYCLE = APP_CONFIG.DAYS_PER_CYCLE;

/** Returns 'YYYY-MM-DD' for today */
export function todayString(): string {
  return new Date().toISOString().split('T')[0];
}

/** Returns 'YYYY-MM' for a given month offset (0 = current) */
export function monthString(offset = 0): string {
  const d = new Date();
  d.setMonth(d.getMonth() + offset);
  return d.toISOString().slice(0, 7);
}

/** Count attendance entries for a specific status in the current calendar month */
export function countThisMonth(
  attendance: Record<string, AttendanceStatus> | undefined | null,
  status: AttendanceStatus
): number {
  if (!attendance) return 0;
  const prefix = monthString();
  return Object.entries(attendance).filter(
    ([date, s]) => date.startsWith(prefix) && s === status
  ).length;
}

// ─── Cycle Billing Logic ───────────────────────────────────────────────────────

/** Count ALL taught days across the lifetime of a student */
export function totalTaughtAllTime(
  attendance: Record<string, AttendanceStatus> | undefined | null
): number {
  if (!attendance) return 0;
  return Object.values(attendance).filter((s) => s === 'taught').length;
}

/**
 * Returns the number of completed cycles that have NOT been paid yet.
 * e.g. if 25 days taught and 1 payment made → floor(25/12) - 1 = 1 month due
 */
export function cyclesDue(student: Student): number {
  if (!student) return 0;
  const totalTaught = totalTaughtAllTime(student.attendance);
  const completedCycles = Math.floor(totalTaught / DAYS_PER_CYCLE);
  const paymentsMade = (student.payments || []).length;
  return Math.max(0, completedCycles - paymentsMade);
}

/**
 * Returns the exact dates for the most recently completed cycle (for notifications).
 * If multiple cycles are due, it returns the dates for the oldest unpaid cycle.
 */
export function getCycleDates(student: Student, cycleIndexOffset: number = 0): string[] {
  if (!student || !student.attendance) return [];
  const taughtDates = Object.entries(student.attendance)
    .filter(([_, status]) => status === 'taught')
    .map(([date]) => date)
    .sort();

  const paymentsMade = (student.payments || []).length;
  const targetCycleIndex = paymentsMade + cycleIndexOffset;

  const startIndex = targetCycleIndex * DAYS_PER_CYCLE;
  return taughtDates.slice(startIndex, startIndex + DAYS_PER_CYCLE);
}

/**
 * Formats a WhatsApp URL with a pre-filled message for a completed cycle.
 */
export function getWhatsAppNotificationUrl(student: Student): string {
  const dates = getCycleDates(student);
  const formattedDates = dates
    .map((d) => {
      const dateObj = new Date(d);
      return dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    })
    .join(', ');

  const due = amountDue(student);
  const message = `Hello ${student.name},\n\nYour tuition for the current month (${DAYS_PER_CYCLE} classes) is complete.\n\nClasses were held on: ${formattedDates}.\n\nTotal amount due: ${formatBDT(due)}.\n\nThank you!`;

  const phone = student.phoneNumber ? student.phoneNumber.replace(/[^0-9]/g, '') : '';
  const baseUrl = phone ? `https://wa.me/${phone}` : `https://wa.me/`;
  return `${baseUrl}?text=${encodeURIComponent(message)}`;
}

/**
 * Returns the progress within the current (incomplete) cycle: days taught since last full cycle.
 */
export function currentCycleDays(student: Student): number {
  if (!student) return 0;
  const totalTaught = totalTaughtAllTime(student.attendance);
  return totalTaught % DAYS_PER_CYCLE;
}

/** Returns how many full cycles have been completed total (paid or unpaid) */
export function totalCompletedCycles(student: Student): number {
  if (!student) return 0;
  return Math.floor(totalTaughtAllTime(student.attendance) / DAYS_PER_CYCLE);
}

/** Amount owed for all unpaid completed cycles (= cycles due × monthly rate) */
export function amountDue(student: Student): number {
  if (!student) return 0;
  return cyclesDue(student) * (student.ratePerMonth || 0);
}

/** Total earnings from all payments made */
export function totalPaid(student: Student): number {
  if (!student || !student.payments) return 0;
  return student.payments.reduce((sum, p) => sum + (p?.amount || 0), 0);
}

// ─── Dashboard Aggregates ──────────────────────────────────────────────────────

/** Total classes taught this month across ALL students */
export function totalTaughtThisMonth(students: Student[]): number {
  return students.reduce((sum, s) => sum + countThisMonth(s.attendance, 'taught'), 0);
}

/** Estimated earnings this month based on taught days (ratePerMonth / DAYS_PER_CYCLE per day) */
export function estimatedEarningsThisMonth(students: Student[]): number {
  return students.reduce((sum, s) => {
    const taught = countThisMonth(s.attendance, 'taught');
    return sum + taught * (s.ratePerMonth / DAYS_PER_CYCLE);
  }, 0);
}

/** Total amount currently due across all students */
export function totalAmountDue(students: Student[]): number {
  return students.reduce((sum, s) => sum + amountDue(s), 0);
}

/** Total payments ever received */
export function totalEverEarned(students: Student[]): number {
  return students.reduce((sum, s) => sum + totalPaid(s), 0);
}

/** Students with at least one unpaid cycle */
export function studentsWithPaymentDue(students: Student[]): Student[] {
  return students.filter((s) => cyclesDue(s) > 0);
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Format number as BDT currency */
export function formatBDT(amount: number | undefined | null): string {
  if (amount == null || isNaN(amount)) return '৳0';
  return '৳' + amount.toLocaleString('en-BD');
}

/** Human-readable month name */
export function currentMonthName(): string {
  return new Date().toLocaleString('default', { month: 'long', year: 'numeric' });
}

/** Configured cycle order of statuses (Open/Closed Principle) */
export const ATTENDANCE_STATUS_ORDER: AttendanceStatus[] = ['taught', 'skipped', 'cancelled'];

/** Cycle through attendance statuses in configured order */
export function cycleStatus(
  current: AttendanceStatus | undefined | null
): AttendanceStatus | null {
  if (!current) return ATTENDANCE_STATUS_ORDER[0];
  const idx = ATTENDANCE_STATUS_ORDER.indexOf(current);
  if (idx === -1 || idx === ATTENDANCE_STATUS_ORDER.length - 1) {
    return null; // clears the status
  }
  return ATTENDANCE_STATUS_ORDER[idx + 1];
}
