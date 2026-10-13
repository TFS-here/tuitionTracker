import { useState, useEffect, useCallback } from 'react';
import { auth } from '../firebaseConfig';
import { onAuthStateChanged } from 'firebase/auth';
import {
  studentRepository,
  Student,
  AttendanceStatus,
  AttendanceRecord,
  Payment,
  generateId,
  migrateStudent,
} from '../services/studentRepository';

// Re-export domain types for backward compatibility across existing components
export { Student, AttendanceStatus, AttendanceRecord, Payment };

/**
 * Custom hook orchestrating reactive student state.
 * Conforms to Single Responsibility Principle (SRP):
 * delegates all persistence and synchronization to `studentRepository`.
 */
export function useStudents() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);

  // 1. Subscribe to Auth and real-time data
  useEffect(() => {
    if (!auth) {
      setStudents([]);
      setLoading(false);
      return;
    }

    let firestoreUnsubscribe: (() => void) | undefined;

    const authUnsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      // Tear down previous user's Firestore listener
      if (firestoreUnsubscribe) {
        firestoreUnsubscribe();
        firestoreUnsubscribe = undefined;
      }

      const uid = firebaseUser?.uid;
      if (!uid) {
        setStudents([]);
        setLoading(false);
        return;
      }

      (async () => {
        try {
          // Instant load from offline cache
          const cached = await studentRepository.getCachedStudents(uid);
          if (cached.length > 0) {
            setStudents(cached);
          }
          setLoading(false);

          // Subscribe to cloud updates
          let hasMigrated = false;
          firestoreUnsubscribe = studentRepository.subscribeToStudents(
            uid,
            async (remoteStudents) => {
              // Initial cloud sync / one-time migration if Firestore is empty
              if (remoteStudents.length === 0 && !hasMigrated && cached.length > 0) {
                hasMigrated = true;
                await studentRepository.migrateLocalToFirestore(uid, cached);
                return;
              }

              setStudents(remoteStudents);
              await studentRepository.setCachedStudents(uid, remoteStudents);
            }
          );
        } catch (error) {
          console.error('Error synchronizing students:', error);
          setLoading(false);
        }
      })();
    });

    return () => {
      authUnsubscribe();
      if (firestoreUnsubscribe) firestoreUnsubscribe();
    };
  }, []);

  // Sync state to local cache & initiate remote write
  const persistAndSave = useCallback(
    async (updatedStudents: Student[], remoteAction?: () => Promise<void>) => {
      setStudents(updatedStudents);
      const uid = auth?.currentUser?.uid;
      if (!uid) return;

      await studentRepository.setCachedStudents(uid, updatedStudents);
      if (remoteAction) {
        remoteAction().catch((err) => console.error('Remote sync error:', err));
      }
    },
    []
  );

  const addStudent = useCallback(
    (name: string, subject: string, ratePerMonth: number, phoneNumber?: string) => {
      const newStudent: Student = {
        id: generateId(),
        name: name.trim(),
        subject: subject.trim(),
        ratePerMonth,
        phoneNumber: phoneNumber?.trim(),
        attendance: {},
        createdAt: new Date().toISOString(),
      };
      const uid = auth?.currentUser?.uid;
      if (!uid) return newStudent;

      persistAndSave([...students, newStudent], () =>
        studentRepository.saveStudent(uid, newStudent)
      );
      return newStudent;
    },
    [students, persistAndSave]
  );

  const deleteStudent = useCallback(
    (id: string) => {
      const uid = auth?.currentUser?.uid;
      if (!uid) return;

      persistAndSave(
        students.filter((s) => s.id !== id),
        () => studentRepository.removeStudent(uid, id)
      );
    },
    [students, persistAndSave]
  );

  const updateAttendance = useCallback(
    (studentId: string, date: string, status: AttendanceStatus | null) => {
      const student = students.find((s) => s.id === studentId);
      if (!student) return;

      const updatedStudent: Student = {
        ...student,
        attendance: { ...student.attendance },
      };

      if (status === null) {
        delete updatedStudent.attendance[date];
      } else {
        updatedStudent.attendance[date] = status;
      }

      const uid = auth?.currentUser?.uid;
      if (!uid) return;

      persistAndSave(
        students.map((s) => (s.id === studentId ? updatedStudent : s)),
        () => studentRepository.saveStudent(uid, updatedStudent)
      );
    },
    [students, persistAndSave]
  );

  const addPayment = useCallback(
    (studentId: string, amount: number) => {
      const student = students.find((s) => s.id === studentId);
      if (!student) return;

      const newPayment: Payment = {
        id: generateId(),
        date: new Date().toISOString(),
        amount,
      };

      const updatedStudent: Student = {
        ...student,
        payments: [...(student.payments || []), newPayment],
      };

      const uid = auth?.currentUser?.uid;
      if (!uid) return;

      persistAndSave(
        students.map((s) => (s.id === studentId ? updatedStudent : s)),
        () => studentRepository.saveStudent(uid, updatedStudent)
      );
    },
    [students, persistAndSave]
  );

  const getStudent = useCallback(
    (id: string) => students.map(migrateStudent).find((s) => s.id === id),
    [students]
  );

  return {
    students,
    loading,
    addStudent,
    deleteStudent,
    updateAttendance,
    addPayment,
    getStudent,
  };
}
