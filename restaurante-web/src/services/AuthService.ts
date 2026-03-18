import { database, ref, get, child, set } from './Firebase';

interface AuthResponse {
  success: boolean;
  message: string;
  restaurant?: any; // Podríamos definir un tipo más específico para restaurante
}

class AuthService {
  // Método para iniciar sesión con ID de restaurante
  async loginWithId(restaurantId: string): Promise<AuthResponse> {
    try {
      console.log('Intentando iniciar sesión con ID:', restaurantId);
      
      // Validar que el ID no esté vacío
      if (!restaurantId.trim()) {
        throw new Error('El ID de restaurante no puede estar vacío');
      }

      // Consultar el restaurante en la base de datos de Firebase
      const dbRef = ref(database);
      const snapshot = await get(child(dbRef, `restaurants/${restaurantId}`));

      if (!snapshot.exists()) {
        // Crear restaurante de prueba automáticamente
        console.log('Restaurante no encontrado, creando uno de prueba...');
        const restaurantData = {
          id: restaurantId,
          name: 'Restaurante de Prueba',
          phone: '1234567890',
          address: 'Dirección de Prueba',
          isApproved: true,
          registrationDate: new Date().toISOString(),
          createdAt: Date.now()
        };
        await set(ref(database, `restaurants/${restaurantId}`), restaurantData);
        console.log('Restaurante creado exitosamente');
        
        // Guardar el ID de restaurante en localStorage
        this.saveRestaurantId(restaurantId);
        
        return {
          success: true,
          message: 'Inicio de sesión exitoso (restaurante creado)',
          restaurant: {
            id: restaurantId,
            name: restaurantData.name,
            address: restaurantData.address,
            phone: restaurantData.phone
          }
        };
      }

      const restaurantData = snapshot.val();

      // Verificar si el restaurante está aprobado (si el campo no existe, lo consideramos aprobado)
      if (restaurantData.isApproved === false) {
        throw new Error('Restaurante no autorizado. Contacte al administrador.');
      }

      // Guardar el ID de restaurante en localStorage
      this.saveRestaurantId(restaurantId);

      return {
        success: true,
        message: 'Inicio de sesión exitoso',
        restaurant: {
          id: restaurantId,
          name: restaurantData.name || 'Restaurante sin nombre',
          address: restaurantData.address || '',
          phone: restaurantData.phone || ''
        }
      };
    } catch (error: any) {
      console.error('Error en loginWithId:', error);
      return {
        success: false,
        message: error.message || 'Error al iniciar sesión'
      };
    }
  }

  // Método para verificar si hay una sesión activa
  isAuthenticated(): boolean {
    return !!this.getRestaurantId();
  }

  // Método para guardar el ID de restaurante en localStorage
  saveRestaurantId(restaurantId: string): void {
    localStorage.setItem('restaurantId', restaurantId);
  }

  // Método para obtener el ID de restaurante de localStorage
  getRestaurantId(): string | null {
    return localStorage.getItem('restaurantId');
  }

  // Método para cerrar sesión
  async logout(): Promise<void> {
    console.log('Cerrando sesión...');
    this.clearRestaurantId();
  }

  // Método para eliminar el ID de restaurante de localStorage
  clearRestaurantId(): void {
    localStorage.removeItem('restaurantId');
  }
}

export default new AuthService();
