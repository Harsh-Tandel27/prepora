import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

// Initialize Firebase Admin SDK
function initFirebaseAdmin() {
  const apps = getApps();

  if (!apps.length) {
    // Get the private key and properly format it
    const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY;
    if (!privateKey) {
      throw new Error("FIREBASE_ADMIN_PRIVATE_KEY environment variable is not set");
    }

    // Remove quotes and convert escaped newlines to actual newlines
    const formattedPrivateKey = privateKey
      .replace(/^"|"$/g, '') // Remove surrounding quotes
      .replace(/\\n/g, '\n'); // Convert escaped newlines to actual newlines

    initializeApp({
      credential: cert({
        projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
        clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
        privateKey: formattedPrivateKey,
      }),
    });
  }

  return {
    auth: getAuth(),
    db: getFirestore(),
  };
}

export const { auth, db } = initFirebaseAdmin();
