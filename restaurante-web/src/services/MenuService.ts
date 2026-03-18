import { database, ref, onValue, get, child, push, set, update as firebaseUpdate } from './Firebase';

interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  available: boolean;
  imageUrl?: string;
  restaurantId: string;
}

interface MenuServiceResponse {
  success: boolean;
  message: string;
  data?: any;
}

class MenuService {
  // Método para obtener los productos del menú de un restaurante
  async getMenuItems(restaurantId: string): Promise<MenuItem[]> {
    try {
      console.log('Obteniendo productos del menú para el restaurante:', restaurantId);
      
      const dbRef = ref(database);
      const snapshot = await get(child(dbRef, 'menu_items'));

      if (!snapshot.exists()) {
        return [];
      }

      const allMenuItems = snapshot.val();
      const menuItems: MenuItem[] = [];

      for (const itemId in allMenuItems) {
        const item = allMenuItems[itemId];
        
        // Filtrar solo los ítems de este restaurante
        if (item.restaurantId === restaurantId) {
          menuItems.push({
            id: itemId,
            name: item.name || '',
            description: item.description || '',
            price: item.price || 0,
            category: item.category || '',
            available: item.available || false,
            imageUrl: item.imageUrl || '',
            restaurantId: restaurantId
          });
        }
      }

      return menuItems;
    } catch (error) {
      console.error('Error obteniendo productos del menú:', error);
      return [];
    }
  }

  // Método para actualizar un producto del menú
  async updateMenuItem(_restaurantId: string, itemId: string, itemData: Partial<MenuItem>): Promise<MenuServiceResponse> {
    try {
      console.log('Actualizando producto del menú:', itemId);
      
      const updates: any = {};
      
      if (itemData.name !== undefined) updates[`menu_items/${itemId}/name`] = itemData.name;
      if (itemData.description !== undefined) updates[`menu_items/${itemId}/description`] = itemData.description;
      if (itemData.price !== undefined) updates[`menu_items/${itemId}/price`] = itemData.price;
      if (itemData.available !== undefined) updates[`menu_items/${itemId}/available`] = itemData.available;

      await firebaseUpdate(ref(database), updates);
      
      return {
        success: true,
        message: 'Producto actualizado exitosamente'
      };
    } catch (error: any) {
      console.error('Error actualizando producto del menú:', error);
      return {
        success: false,
        message: error.message || 'Error al actualizar el producto del menú'
      };
    }
  }

  // Método para añadir un nuevo producto al menú
  async addMenuItem(restaurantId: string, newItem: Omit<MenuItem, 'id' | 'restaurantId'>): Promise<MenuServiceResponse> {
    try {
      console.log('Añadiendo nuevo producto al menú para el restaurante:', restaurantId);
      
      // Generar un nuevo ID único
      const newMenuRef = push(ref(database, 'menu_items'));
      const menuItemId = newMenuRef.key;
      
      if (!menuItemId) {
        throw new Error('No se pudo generar un ID para el producto');
      }
      
      // Crear el objeto del producto
      const menuItem = {
        name: newItem.name,
        description: newItem.description || '',
        price: newItem.price,
        category: newItem.category || '',
        available: newItem.available !== undefined ? newItem.available : true,
        imageUrl: newItem.imageUrl || '',
        restaurantId: restaurantId
      };
      
      // Guardar en Firebase
      await set(newMenuRef, menuItem);
      
      return {
        success: true,
        message: 'Producto añadido exitosamente'
      };
    } catch (error: any) {
      console.error('Error añadiendo producto del menú:', error);
      return {
        success: false,
        message: error.message || 'Error al añadir el producto del menú'
      };
    }
  }

  // Método para observar cambios en tiempo real en los productos del menú
  observeMenuItems(restaurantId: string, callback: (items: MenuItem[]) => void): () => void {
    console.log('Observando cambios en productos del menú para el restaurante:', restaurantId);
    
    const menuRef = ref(database, 'menu_items');
    
    const unsubscribe = onValue(menuRef, async (snapshot) => {
      if (snapshot.exists()) {
        const allMenuItems = snapshot.val();
        const menuItems: MenuItem[] = [];

        for (const itemId in allMenuItems) {
          const item = allMenuItems[itemId];
          
          // Filtrar solo los ítems de este restaurante
          if (item.restaurantId === restaurantId) {
            menuItems.push({
              id: itemId,
              name: item.name || '',
              description: item.description || '',
              price: item.price || 0,
              category: item.category || '',
              available: item.available || false,
              imageUrl: item.imageUrl || '',
              restaurantId: restaurantId
            });
          }
        }

        callback(menuItems);
      } else {
        callback([]);
      }
    }, (error) => {
      console.error('Error observando productos del menú:', error);
      callback([]);
    });
    
    return unsubscribe;
  }
}

export default new MenuService();