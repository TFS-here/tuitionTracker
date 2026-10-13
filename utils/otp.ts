import emailjs from '@emailjs/react-native';
import { EMAILJS_CONFIG } from '../firebaseConfig';

/** Generate a cryptographically-random 6-digit OTP */
export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/** Store an OTP in memory with a 5-minute expiry */
interface OTPRecord {
  code: string;
  expiresAt: number;
}

const otpStore = new Map<string, OTPRecord>();

export function storeOTP(email: string, code: string) {
  otpStore.set(email.toLowerCase(), {
    code,
    expiresAt: Date.now() + 5 * 60 * 1000, // 5 minutes
  });
}

export function verifyOTP(email: string, inputCode: string): boolean {
  const record = otpStore.get(email.toLowerCase());
  if (!record) return false;
  if (Date.now() > record.expiresAt) {
    otpStore.delete(email.toLowerCase());
    return false;
  }
  if (record.code !== inputCode) return false;
  otpStore.delete(email.toLowerCase());
  return true;
}

export function clearOTP(email: string) {
  otpStore.delete(email.toLowerCase());
}

/** Send OTP email via EmailJS */
export async function sendOTPEmail(
  toEmail: string,
  toName: string,
  otp: string
): Promise<void> {
  if (
    EMAILJS_CONFIG.serviceId === 'YOUR_SERVICE_ID' ||
    EMAILJS_CONFIG.publicKey === 'YOUR_PUBLIC_KEY'
  ) {
    // DEV MODE: Show the OTP in console if EmailJS not configured
    console.log(`[DEV] OTP for ${toEmail}: ${otp}`);
    return;
  }

  await emailjs.send(
    EMAILJS_CONFIG.serviceId,
    EMAILJS_CONFIG.templateId,
    {
      to_email: toEmail,
      to_name: toName || 'there',
      otp: otp,
      otp_code: otp,
    },
    { publicKey: EMAILJS_CONFIG.publicKey }
  );
}
