import AsyncStorage from '@react-native-async-storage/async-storage';
import { collection, doc, setDoc, deleteDoc, onSnapshot, Unsubscribe } from 'firebase/firestore';
import { db } from '../firebaseConfig';

export type AttendanceStatus = 'taught' | 'skipped' | 'cancelled';

export interface AttendanceRecord {
  [date: string]: AttendanceStatus; // date format: 'YYYY-MM-DD'
}

export interface Payment {
  id: string;
  date: string; // ISO string
  amount: number;
}

export interface Student {
  id: string;
  name: string;
  subject: string;
  ratePerMonth: number; // BDT per month (12 days)
  phoneNumber?: string; // For WhatsApp notifications
  attendance: AttendanceRecord;
  payments?: Payment[]; // Optional for backwards compatibility
  createdAt: string;
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
}

/** Migrate legacy ratePerClass field to ratePerMonth and guarantee safe defaults */
export function migrateStudent(s: any): Student {
  return {
    ...s,
    attendance: s?.attendance && typeof s.attendance === 'object' ? s.attendance : {},
    payments: Array.isArray(s?.payments) ? s.payments : [],
    ratePerMonth: s?.ratePerMonth ?? s?.ratePerClass ?? 0,
  };
}

export interface IStudentRepository {
  getCachedStudents(userId: string): Promise<Student[]>;
  setCachedStudents(userId: string, students: Student[]): Promise<void>;
  subscribeToStudents(
    userId: string,
    onData: (students: Student[]) => void,
    onError?: (err: Error) => void
  ): Unsubscribe | undefined;
  saveStudent(userId: string, student: Student): Promise<void>;
  removeStudent(userId: string, studentId: string): Promise<void>;
  migrateLocalToFirestore(userId: string, students: Student[]): Promise<void>;
}

class StudentRepository implements IStudentRepository {
  private getCacheKey(userId: string): string {
    return `@tuition_tracker_students_${userId}`;
  }

  async getCachedStudents(userId: string): Promise<Student[]> {
    const raw = await AsyncStorage.getItem(this.getCacheKey(userId));
    if (!raw) return [];
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed.map(migrateStudent);
      }
    } catch {
      // Return empty if corrupted cache
    }
    return [];
  }

  async setCachedStudents(userId: string, students: Student[]): Promise<void> {
    await AsyncStorage.setItem(this.getCacheKey(userId), JSON.stringify(students));
  }

  subscribeToStudents(
    userId: string,
    onData: (students: Student[]) => void,
    onError?: (err: Error) => void
  ): Unsubscribe | undefined {
    if (!db) return undefined;

    const studentsCol = collection(db, 'users', userId, 'students');
    return onSnapshot(
      studentsCol,
      (snapshot) => {
        const remoteStudents = snapshot.docs.map((docSnap) => migrateStudent(docSnap.data()));
        onData(remoteStudents);
      },
      (err) => {
        if (onError) onError(err);
        else console.error('Firestore listener error:', err);
      }
    );
  }

  async saveStudent(userId: string, student: Student): Promise<void> {
    if (!db) return;
    await setDoc(doc(db, 'users', userId, 'students', student.id), student);
  }

  async removeStudent(userId: string, studentId: string): Promise<void> {
    if (!db) return;
    await deleteDoc(doc(db, 'users', userId, 'students', studentId));
  }

  async migrateLocalToFirestore(userId: string, students: Student[]): Promise<void> {
    if (!db || students.length === 0) return;
    for (const s of students) {
      await this.saveStudent(userId, s);
    }
  }
}

export const studentRepository = new StudentRepository();
