import { initializeApp, getApps } from 'firebase/app';
import { getDatabase } from 'firebase/database';

// Configuración de Firebase - usando el mismo proyecto que repartidor-web y restaurante-web
const firebaseConfig = {
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL || 'https://proyecto-new-37f18-default-rtdb.firebaseio.com'
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];

// Initialize Realtime Database
export const database = getDatabase(app);

export default app;
