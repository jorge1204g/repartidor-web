// Configuración de Firebase para la aplicación del restaurante
import { initializeApp, getApps } from 'firebase/app';
import { getDatabase, ref, onValue, set, update, get, child, push } from 'firebase/database';

// Configuración de Firebase (misma que repartidor-web)
const firebaseConfig = {
  databaseURL: "https://myappdelivery-4a576-default-rtdb.firebaseio.com"
};

// Inicializar Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];
const database = getDatabase(app);

export { app, database, ref, onValue, set, update, get, child, push };