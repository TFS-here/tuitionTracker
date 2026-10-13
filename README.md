# TuitionTracker 📚

A modern, glassmorphic React Native & Expo application designed for private tutors and coaching teachers to seamlessly track students, monitor attendance cycles, manage tuition fees, and handle billing reminders.

---

## ✨ Features

- **🧑‍🎓 Student Management**: Add, update, and manage student profiles, contact info, grade, subjects, and custom fee cycles.
- **📅 Attendance & Cycle Tracking**: Interactive calendar marking with present/absent states and automatic cycle progress calculation.
- **💰 Fee & Billing Insights**: Track active billing cycles, overdue payments, and automated status calculations.
- **🔒 Secure Authentication**: Firebase Email/Password & Google Sign-In with protected routes.
- **🎨 Glassmorphic Dark UI**: Premium visual experience with blurred acrylic glass cards, smooth gradients, and Outfit typography.
- **📧 Email Notifications**: Integrated EmailJS support for attendance and reminder alerts.

---

## 🛠️ Tech Stack

- **Framework**: [Expo SDK 57](https://expo.dev) + [React Native 0.86](https://reactnative.dev)
- **Routing**: [Expo Router](https://docs.expo.dev/router/introduction/) (File-based navigation)
- **Backend & Database**: [Firebase v10](https://firebase.google.com) (Firestore & Authentication)
- **State & Storage**: React Context + `@react-native-async-storage/async-storage`
- **Animations & Blur**: `react-native-reanimated`, `expo-blur`, `expo-linear-gradient`
- **Typography**: `@expo-google-fonts/outfit`

---

## 🚀 Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/TFS-here/tuitionTracker.git
cd tuitionTracker
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Copy the example `.env.example` file to create your own `.env` file:

```bash
cp .env.example .env
```

Open `.env` and fill in your Firebase project and EmailJS credentials:

```env
# Firebase Configuration
EXPO_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
EXPO_PUBLIC_FIREBASE_APP_ID=your_app_id
EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id

# EmailJS Configuration
EXPO_PUBLIC_EMAILJS_SERVICE_ID=your_service_id
EXPO_PUBLIC_EMAILJS_TEMPLATE_ID=your_template_id
EXPO_PUBLIC_EMAILJS_PUBLIC_KEY=your_public_key
```

> **Note**: `.env` is ignored by `.gitignore` and must never be committed to source control.

---

## 📱 Running the App

Start the Expo development server:

```bash
npx expo start
```

- Press `a` to open in Android Emulator / device
- Press `i` to open in iOS Simulator (macOS only)
- Press `w` to open in Web browser
- Or scan the QR code with **Expo Go** on your physical device

---

## 📂 Project Structure

```text
├── app/                  # Expo Router file-based screens and routes
│   ├── (tabs)/           # Main tab navigation (Home, Students, Profile)
│   ├── attendance/       # Dynamic student attendance screen
│   ├── auth/             # Login, register, and password reset screens
│   └── _layout.tsx       # Root layout & authentication guard
├── components/           # Reusable UI & glassmorphic components
│   └── attendance/       # Attendance-specific cards and stats widgets
├── constants/            # Theme colors, typography, and app config
├── hooks/                # Custom React hooks (useAuth, useStudents)
├── services/             # Firestore repository & data services
├── utils/                # Utility helpers (attendance, OTP, EmailJS)
├── firebaseConfig.ts     # Firebase SDK initialization (loads from .env)
├── .env.example          # Environment variable template
└── .gitignore            # Git exclusion rules
```

---

## 📄 License

This project is private and proprietary.
