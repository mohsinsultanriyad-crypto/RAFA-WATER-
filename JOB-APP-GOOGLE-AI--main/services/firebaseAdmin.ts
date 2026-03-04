import * as admin from 'firebase-admin';

let firebaseAdminApp: admin.app.App | null = null;

export function getFirebaseApp(): admin.app.App {
  if (firebaseAdminApp) return firebaseAdminApp;

  const b64Config = process.env.FIREBASE_ADMIN_JSON_B64;
  if (!b64Config) {
    throw new Error("Missing FIREBASE_ADMIN_JSON_B64 environment variable");
  }

  try {
    const jsonConfig = Buffer.from(b64Config, 'base64').toString('utf8');
    const serviceAccount = JSON.parse(jsonConfig);

    firebaseAdminApp = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });

    return firebaseAdminApp;
  } catch (error) {
    console.error("Failed to initialize Firebase Admin:", error);
    throw new Error("Invalid FIREBASE_ADMIN_JSON_B64 environment variable or failed to parse");
  }
}

export { admin };
