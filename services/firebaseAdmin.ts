import admin from "firebase-admin";
import { Buffer } from "buffer";

let firebaseApp: admin.app.App | null = null;

export function getFirebaseApp() {
  if (firebaseApp) return firebaseApp;
  const b64 = process.env.FIREBASE_ADMIN_JSON_B64;
  if (!b64) throw new Error("FIREBASE_ADMIN_JSON_B64 env var not set");
  const jsonStr = Buffer.from(b64, "base64").toString("utf8");
  const serviceAccount = JSON.parse(jsonStr);
  firebaseApp = admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
  return firebaseApp;
}