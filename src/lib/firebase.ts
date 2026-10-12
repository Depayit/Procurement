import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, signInAnonymously, onAuthStateChanged, type User } from 'firebase/auth';
import { getFirestore, doc, getDocFromServer } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const db = firebaseConfig.firestoreDatabaseId 
  ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
  : getFirestore(app);
export const auth = getAuth(app);
export { firebaseConfig };

// Auto-authenticate anonymously for seamless Firestore security rule compliance
let authUser: User | null = null;
onAuthStateChanged(auth, (user) => {
  authUser = user;
});

export async function ensureFirebaseAuth(): Promise<User | null> {
  if (auth.currentUser) return auth.currentUser;
  try {
    const cred = await signInAnonymously(auth);
    return cred.user;
  } catch (err) {
    console.warn('[Firebase Auth] Anonymous sign-in notice (offline or rules fallback):', err);
    return null;
  }
}

// Auto-trigger auth check non-blockingly
if (typeof window !== 'undefined') {
  ensureFirebaseAuth().catch(() => {});
}

export async function testFirebaseConnection(): Promise<{
  success: boolean;
  latencyMs?: number;
  projectId: string;
  databaseId?: string;
  error?: string;
}> {
  const startTime = Date.now();
  const projectId = firebaseConfig.projectId;
  const databaseId = firebaseConfig.firestoreDatabaseId;

  try {
    await ensureFirebaseAuth();
    // Ping Firestore with lightweight server request
    await getDocFromServer(doc(db, '_connection_test', 'ping')).catch((err) => {
      // Permission-denied or not-found still proves network connection to Firestore reached Google Cloud!
      if (err?.code === 'permission-denied' || err?.code === 'not-found') {
        return;
      }
      throw err;
    });

    const latencyMs = Date.now() - startTime;
    return {
      success: true,
      latencyMs,
      projectId,
      databaseId
    };
  } catch (err: any) {
    return {
      success: false,
      error: err?.message || 'Cannot reach Firestore server',
      projectId,
      databaseId
    };
  }
}
