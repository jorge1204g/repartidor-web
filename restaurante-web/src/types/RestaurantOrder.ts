import { Order } from './Order';

// Extender el tipo Order para la vista específica del restaurante
export interface RestaurantOrder extends Order {
  tableNumber: string;
  timestamp: string;
  customerName: string;
  customerPhone: string;
  deliveryAddress: string;
  specialRequests?: string;
}