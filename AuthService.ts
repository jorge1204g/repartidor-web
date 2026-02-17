import { database, ref, get, child } from './Firebase';
import { DeliveryPerson } from '../types/DeliveryPerson';

interface AuthResponse {
  success: boolean;
  message: string;
  deliveryPerson?: DeliveryPerson;
}

class AuthService {
  // Método para iniciar sesión con ID de repartidor
  async loginWithId(deliveryId: string): Promise<AuthResponse> {
    try {
      console.log('Intentando iniciar sesión con ID:', deliveryId);
      
      // Validar que el ID no esté vacío
      if (!deliveryId.trim()) {
        throw new Error('El ID de repartidor no puede estar vacío');
      }

      // Consultar el repartidor en la base de datos de Firebase
      const dbRef = ref(database);
      const snapshot = await get(child(dbRef, `delivery_persons/${deliveryId}`));

      if (!snapshot.exists()) {
        throw new Error('ID de repartidor no encontrado');
      }

      const deliveryPersonData = snapshot.val();

      // Verificar si el repartidor está aprobado
      if (!deliveryPersonData.isApproved) {
        throw new Error('Repartidor no autorizado. Contacte al administrador.');
      }

      // Obtener también el estado de presencia
      const presenceSnapshot = await get(child(dbRef, `presence/${deliveryId}`));
      let presenceData = { isOnline: false, isActive: false, lastSeen: 0 };
      
      if (presenceSnapshot.exists()) {
        presenceData = presenceSnapshot.val();
      }

      // Combinar datos del repartidor con el estado de presencia
      const deliveryPerson: DeliveryPerson = {
        id: deliveryId,
        name: deliveryPersonData.name || '',
        phone: deliveryPersonData.phone || '',
        email: deliveryPersonData.email || '',
        isApproved: deliveryPersonData.isApproved || false,
        registrationDate: deliveryPersonData.registrationDate || '',
        isOnline: presenceData.isOnline,
        isActive: presenceData.isActive,
        lastSeen: presenceData.lastSeen
      };

      // Guardar el ID de repartidor en localStorage
      this.saveDeliveryId(deliveryId);

      return {
        success: true,
        message: 'Inicio de sesión exitoso',
        deliveryPerson
      };
    } catch (error: any) {
      console.error('Error en loginWithId:', error);
      return {
        success: false,
        message: error.message || 'Error al iniciar sesión'
      };
    }
  }

  // Método para verificar si la cuenta del repartidor sigue siendo válida
  async isAccountValid(deliveryId: string): Promise<boolean> {
    try {
      console.log('Verificando si la cuenta sigue siendo válida para:', deliveryId);
      
      // Consultar el repartidor en la base de datos de Firebase
      const dbRef = ref(database);
      const snapshot = await get(child(dbRef, `delivery_persons/${deliveryId}`));

      if (!snapshot.exists()) {
        console.log('Cuenta no encontrada, el repartidor ha sido eliminado');
        return false;
      }

      const deliveryPersonData = snapshot.val();
      
      // Verificar si el repartidor sigue estando aprobado
      const isStillApproved = deliveryPersonData.isApproved;
      console.log('Estado de aprobación:', isStillApproved);
      
      return isStillApproved;
    } catch (error) {
      console.error('Error verificando validez de cuenta:', error);
      return false;
    }
  }

  // Método para cerrar sesión
  async logout(): Promise<void> {
    console.log('Cerrando sesión...');
    this.clearDeliveryId();
  }

  // Método para verificar si hay una sesión activa
  isAuthenticated(): boolean {
    return !!this.getDeliveryId();
  }

  // Método para guardar el ID de repartidor en localStorage
  saveDeliveryId(deliveryId: string): void {
    localStorage.setItem('deliveryId', deliveryId);
  }

  // Método para obtener el ID de repartidor de localStorage
  getDeliveryId(): string | null {
    return localStorage.getItem('deliveryId');
  }

  // Método para eliminar el ID de repartidor de localStorage
  clearDeliveryId(): void {
    localStorage.removeItem('deliveryId');
  }
}

export default new AuthService();