import { database, ref, set, get } from './Firebase';

class TestSetupService {
  // Método para crear un repartidor de prueba
  async createTestDeliveryPerson(deliveryId: string, name: string, phone: string): Promise<{success: boolean, message: string}> {
    try {
      console.log('Creando repartidor de prueba:', deliveryId);

      // Verificar si el repartidor ya existe
      const existingDeliveryPerson = await get(ref(database, `delivery_persons/${deliveryId}`));
      
      if (existingDeliveryPerson.exists()) {
        return {
          success: false,
          message: 'El repartidor ya existe en la base de datos'
        };
      }

      // Datos del repartidor de prueba
      const deliveryPersonData = {
        id: deliveryId,
        name: name,
        phone: phone,
        email: `${deliveryId}@test.com`,
        isApproved: true, // Importante: debe estar aprobado para que pueda iniciar sesión
        registrationDate: new Date().toISOString(),
        createdAt: Date.now()
      };

      // Guardar el repartidor en Firebase
      await set(ref(database, `delivery_persons/${deliveryId}`), deliveryPersonData);

      // Inicializar estado de presencia
      const presenceData = {
        isOnline: false,
        isActive: false,
        lastSeen: Date.now()
      };
      await set(ref(database, `presence/${deliveryId}`), presenceData);

      return {
        success: true,
        message: 'Repartidor de prueba creado exitosamente'
      };
    } catch (error: any) {
      console.error('Error creando repartidor de prueba:', error);
      return {
        success: false,
        message: error.message || 'Error al crear el repartidor de prueba'
      };
    }
  }

  // Método para crear un restaurante de prueba
  async createTestRestaurant(restaurantId: string, name: string, phone: string, address: string): Promise<{success: boolean, message: string}> {
    try {
      console.log('Creando restaurante de prueba:', restaurantId);

      // Verificar si el restaurante ya existe
      const existingRestaurant = await get(ref(database, `restaurants/${restaurantId}`));
      
      if (existingRestaurant.exists()) {
        return {
          success: false,
          message: 'El restaurante ya existe en la base de datos'
        };
      }

      // Datos del restaurante de prueba
      const restaurantData = {
        id: restaurantId,
        name: name,
        phone: phone,
        address: address,
        isApproved: true,
        registrationDate: new Date().toISOString(),
        createdAt: Date.now()
      };

      // Guardar el restaurante en Firebase
      await set(ref(database, `restaurants/${restaurantId}`), restaurantData);

      return {
        success: true,
        message: 'Restaurante de prueba creado exitosamente'
      };
    } catch (error: any) {
      console.error('Error creando restaurante de prueba:', error);
      return {
        success: false,
        message: error.message || 'Error al crear el restaurante de prueba'
      };
    }
  }
}

export default new TestSetupService();