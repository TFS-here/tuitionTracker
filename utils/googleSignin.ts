import Constants, { ExecutionEnvironment } from 'expo-constants';

export const GOOGLE_NATIVE_UNAVAILABLE =
  'Google sign-in needs a development build (it is not available inside Expo Go). Use email/password in Expo Go, or run `npx expo run:android`.';

function getWebClientId(): string {
  return (
    process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID ??
    '33948239115-sv8cn253epufs97nk0gpa5ipudnr16cn.apps.googleusercontent.com'
  );
}

export function isExpoGo(): boolean {
  return (
    Constants.appOwnership === 'expo' ||
    Constants.executionEnvironment === ExecutionEnvironment.StoreClient
  );
}

export async function getGoogleIdToken(): Promise<string> {
  if (isExpoGo()) {
    throw new Error(GOOGLE_NATIVE_UNAVAILABLE);
  }
  let GoogleSignin: any;
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    GoogleSignin = require('@react-native-google-signin/google-signin').GoogleSignin;
  } catch {
    throw new Error(GOOGLE_NATIVE_UNAVAILABLE);
  }
  GoogleSignin.configure({ webClientId: getWebClientId() });
  await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
  const userInfo: any = await GoogleSignin.signIn();
  const idToken = userInfo?.data?.idToken ?? userInfo?.idToken;
  if (!idToken) {
    throw new Error('No ID token returned from Google.');
  }
  return idToken;
}
