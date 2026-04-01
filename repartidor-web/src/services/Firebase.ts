// Configuración de Firebase para la aplicación del repartidor
import { initializeApp, getApps } from 'firebase/app';
import { getDatabase, ref, onValue, set, update, get, child, push } from 'firebase/database';

// Configuración de Firebase
const firebaseConfig = {
  databaseURL: "https://proyecto-new-37f18-default-rtdb.firebaseio.com"
};

// Inicializar Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];
const database = getDatabase(app);

export { database, ref, onValue, set, update, get, child, push };
