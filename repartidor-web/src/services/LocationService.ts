import { ref, set, onValue, get } from 'firebase/database';
import { database } from './Firebase';

interface LocationData {
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: number;
  speed?: number;
  heading?: number;
}

class LocationService {
  private static instance: LocationService;
  private watchId: number | null = null;
  private currentLocation: LocationData | null = null;
  private deliveryId: string | null = null;

  private constructor() {}

  public static getInstance(): LocationService {
    if (!LocationService.instance) {
      LocationService.instance = new LocationService();
    }
    return LocationService.instance;
  }

  // Solicitar permisos y comenzar a rastrear ubicación
  async startTracking(deliveryId: string): Promise<boolean> {
    this.deliveryId = deliveryId;

    // Verificar si el navegador soporta geolocalización
    if (!('geolocation' in navigator)) {
      console.error('❌ [UBICACIÓN] Geolocalización no soportada en este navegador');
      return false;
    }

    // Solicitar permiso de ubicación
    try {
      console.log('📍 [UBICACIÓN] Solicitando permiso de ubicación...');
      
      // Obtener ubicación inicial
      await this.getCurrentLocation();
      
      // Iniciar seguimiento continuo
      this.startWatching();
      
      console.log('✅ [UBICACIÓN] Rastreo de ubicación iniciado');
      return true;
    } catch (error) {
      console.error('❌ [UBICACIÓN] Error al solicitar permiso:', error);
      return false;
    }
  }

  // Obtener ubicación actual
  private getCurrentLocation(): Promise<LocationData> {
    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location: LocationData = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: position.timestamp,
            speed: position.coords.speed || undefined,
            heading: position.coords.heading || undefined
          };

          this.currentLocation = location;
          console.log('✅ [UBICACIÓN] Ubicación obtenida:', location);
          
          // Guardar en Firebase
          this.saveLocationToFirebase(location);
          
          resolve(location);
        },
        (error) => {
          console.error('❌ [UBICACIÓN] Error al obtener ubicación:', error);
          reject(error);
        },
        {
          enableHighAccuracy: true, // Alta precisión
          timeout: 10000, // Timeout de 10 segundos
          maximumAge: 0 // No usar caché
        }
      );
    });
  }

  // Iniciar seguimiento continuo
  private startWatching(): void {
    if (this.watchId !== null) {
      // Detener seguimiento anterior si existe
      navigator.geolocation.clearWatch(this.watchId);
    }

    this.watchId = navigator.geolocation.watchPosition(
      (position) => {
        const location: LocationData = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: position.timestamp,
          speed: position.coords.speed || undefined,
          heading: position.coords.heading || undefined
        };

        this.currentLocation = location;
        console.log('📍 [UBICACIÓN] Ubicación actualizada:', location);
        
        // Guardar en Firebase cada vez que se actualiza
        this.saveLocationToFirebase(location);
      },
      (error) => {
        console.error('❌ [UBICACIÓN] Error en watchPosition:', error);
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 5000 // Permitir caché de hasta 5 segundos
      }
    );

    console.log('🔄 [UBICACIÓN] Seguimiento continuo iniciado, watchId:', this.watchId);
  }

  // Guardar ubicación en Firebase
  private saveLocationToFirebase(location: LocationData): void {
    if (!this.deliveryId) {
      console.warn('⚠️ [UBICACIÓN] No hay deliveryId para guardar ubicación');
      return;
    }

    try {
      const locationRef = ref(database, `delivery_locations/${this.deliveryId}`);
      set(locationRef, {
        ...location,
        deliveryId: this.deliveryId,
        updatedAt: Date.now()
      }).then(() => {
        console.log('✅ [FIREBASE] Ubicación guardada en Firebase');
      }).catch((error) => {
        console.error('❌ [FIREBASE] Error al guardar ubicación:', error);
      });
    } catch (error) {
      console.error('❌ [UBICACIÓN] Error al crear referencia de Firebase:', error);
    }
  }

  // Detener seguimiento
  stopTracking(): void {
    if (this.watchId !== null) {
      navigator.geolocation.clearWatch(this.watchId);
      this.watchId = null;
      console.log('⏹️ [UBICACIÓN] Seguimiento detenido');
    }
  }

  // Obtener ubicación actual
  getCurrentLocationData(): LocationData | null {
    return this.currentLocation;
  }

  // Obtener última ubicación de un repartidor específico desde Firebase
  async getDeliveryLocation(deliveryId: string): Promise<LocationData | null> {
    try {
      const locationRef = ref(database, `delivery_locations/${deliveryId}`);
      const snapshot = await get(locationRef);
      
      if (snapshot.exists()) {
        return snapshot.val() as LocationData;
      }
      return null;
    } catch (error) {
      console.error('❌ [UBICACIÓN] Error al obtener ubicación del repartidor:', error);
      return null;
    }
  }

  // Escuchar cambios de ubicación en tiempo real
  onLocationChange(deliveryId: string, callback: (location: LocationData | null) => void): () => void {
    const locationRef = ref(database, `delivery_locations/${deliveryId}`);
    
    const unsubscribe = onValue(locationRef, (snapshot) => {
      if (snapshot.exists()) {
        callback(snapshot.val() as LocationData);
      } else {
        callback(null);
      }
    });

    return unsubscribe;
  }
}

export default LocationService.getInstance();
