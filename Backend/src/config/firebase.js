import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getMessaging as getAdminMessaging } from 'firebase-admin/messaging';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

// Ensure .env is loaded regardless of process.cwd()
const envPaths = [
  path.resolve(process.cwd(), '.env'),
  path.resolve(process.cwd(), 'Backend', '.env')
];
for (const envPath of envPaths) {
  if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath });
  }
}

let firebaseApp = null;
let messagingInstance = null;

try {
  // Option 1: Load from environment variables (.env)
  if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY) {
    let rawKey = process.env.FIREBASE_PRIVATE_KEY;
    // Replace literal escaped \n with actual line breaks
    let formattedKey = rawKey.includes('\\n') ? rawKey.replace(/\\n/g, '\n') : rawKey;
    if (formattedKey.startsWith('"') && formattedKey.endsWith('"')) {
      formattedKey = formattedKey.slice(1, -1);
    }

    firebaseApp = initializeApp({
      credential: cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: formattedKey
      })
    });
    messagingInstance = getAdminMessaging(firebaseApp);
    console.log(`[Firebase] Admin SDK initialized successfully for project: ${process.env.FIREBASE_PROJECT_ID}`);
  }

  // Option 2: Fallback to service account JSON file if configured
  if (!firebaseApp && process.env.FIREBASE_SERVICE_ACCOUNT_PATH) {
    const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;
    const resolvedPath = path.isAbsolute(serviceAccountPath)
      ? serviceAccountPath
      : path.resolve(process.cwd(), serviceAccountPath);

    if (fs.existsSync(resolvedPath)) {
      const serviceAccount = JSON.parse(fs.readFileSync(resolvedPath, 'utf8'));
      firebaseApp = initializeApp({
        credential: cert(serviceAccount)
      });
      messagingInstance = getAdminMessaging(firebaseApp);
      console.log('[Firebase] Admin SDK initialized via file:', resolvedPath);
    }
  }

  // Option 3: Standard GOOGLE_APPLICATION_CREDENTIALS
  if (!firebaseApp && process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    firebaseApp = initializeApp();
    messagingInstance = getAdminMessaging(firebaseApp);
    console.log('[Firebase] Admin SDK initialized via GOOGLE_APPLICATION_CREDENTIALS.');
  }

  if (!firebaseApp) {
    console.warn('[Firebase] Warning: Firebase service account credentials not found. Notifications will run in simulation mode.');
  }
} catch (error) {
  console.error('[Firebase] Error initializing Firebase Admin SDK:', error.message);
}

export const isFirebaseConfigured = () => !!messagingInstance;
export const getMessaging = () => messagingInstance;
export default firebaseApp;
