import { database, ref, set, get, child, onValue } from './Firebase';

interface PresenceServiceResponse {
  success: boolean;
  message: string;
}

class PresenceService {
  // Método para actualizar el estado de presencia del repartidor
  async updatePresence(deliveryId: string, isOnline: boolean, isActive: boolean): Promise<PresenceServiceResponse> {
    try {
      console.log('Actualizando presencia para:', deliveryId, 'en línea:', isOnline, 'activo:', isActive);
      
      // Preparar los datos de presencia
      const presenceData = {
        isOnline,
        isActive,
        lastSeen: Date.now()
      };
      
      // Actualizar la presencia en Firebase
      await set(ref(database, `presence/${deliveryId}`), presenceData);
      
      return {
        success: true,
        message: 'Presencia actualizada exitosamente'
      };
    } catch (error: any) {
      console.error('Error actualizando presencia:', error);
      return {
        success: false,
        message: error.message || 'Error al actualizar la presencia'
      };
    }
  }

  // Método para observar el estado de otros repartidores
  observeDeliveryPersons(callback: (deliveryPersons: any[]) => void): () => void {
    console.log('Observando estado de otros repartidores');
    
    // Crear una referencia a la base de datos de presencia
    const presenceRef = ref(database, 'presence');
    
    // Configurar listener en tiempo real
    const unsubscribe = onValue(presenceRef, async (snapshot) => {
      if (snapshot.exists()) {
        const allPresence = snapshot.val();
        const deliveryPersonsArray: any[] = [];

        for (const deliveryId in allPresence) {
          const presenceData = allPresence[deliveryId];
          
          // Consultar también los datos del repartidor
          const dbRef = ref(database);
          const personSnapshot = await get(child(dbRef, `delivery_persons/${deliveryId}`));
          
          if (personSnapshot.exists()) {
            const personData = personSnapshot.val();
            deliveryPersonsArray.push({
              id: deliveryId,
              name: personData.name || '',
              phone: personData.phone || '',
              isOnline: presenceData.isOnline || false,
              isActive: presenceData.isActive || false,
              lastSeen: presenceData.lastSeen || 0
            });
          }
        }
        
        callback(deliveryPersonsArray);
      } else {
        callback([]);
      }
    }, (error) => {
      console.error('Error observando presencia de repartidores:', error);
      callback([]);
    });
    
    // Devolver función para cancelar la suscripción
    return unsubscribe;
  }

  // Método para obtener el estado actual de presencia de un repartidor
  async getPresence(deliveryId: string): Promise<{ isOnline: boolean; isActive: boolean; lastSeen: number }> {
    console.log('Obteniendo presencia para:', deliveryId);
    
    try {
      const dbRef = ref(database);
      const snapshot = await get(child(dbRef, `presence/${deliveryId}`));
      
      if (snapshot.exists()) {
        const presenceData = snapshot.val();
        return {
          isOnline: presenceData.isOnline || false,
          isActive: presenceData.isActive || false,
          lastSeen: presenceData.lastSeen || 0
        };
      } else {
        // Si no existe presencia registrada, retornar valores por defecto
        return {
          isOnline: false,
          isActive: false,
          lastSeen: 0
        };
      }
    } catch (error) {
      console.error('Error obteniendo presencia:', error);
      // En caso de error, retornar valores por defecto
      return {
        isOnline: false,
        isActive: false,
        lastSeen: 0
      };
    }
  }
}

export default new PresenceService();