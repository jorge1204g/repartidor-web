// Configuración de la aplicación para Firebase
export const FIREBASE_CONFIG = {
  databaseURL: 'https://myappdelivery-4a576-default-rtdb.firebaseio.com',
};

// Configuración para mantener compatibilidad con código existente
export const APP_CONFIG = {
  useFirebase: true, // Indicar que estamos usando Firebase
  apiTimeout: 10000, // Timeout para llamadas a la API
  pollingInterval: 5000, // Intervalo para polling periódico
};
