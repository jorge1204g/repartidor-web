export interface Location {
  latitude: number;
  longitude: number;
}

export interface Customer {
  name: string;
  phone: string;
  address: string;
  location: Location;
}

export interface OrderItem {
  name: string;
  quantity: number;
  price: number;
}

export enum OrderStatus {
  PENDING = 'PENDING',
  ASSIGNED = 'ASSIGNED',
  MANUAL_ASSIGNED = 'MANUAL_ASSIGNED',
  ACCEPTED = 'ACCEPTED',
  ON_THE_WAY_TO_STORE = 'ON_THE_WAY_TO_STORE',
  ARRIVED_AT_STORE = 'ARRIVED_AT_STORE',
  PICKING_UP_ORDER = 'PICKING_UP_ORDER',
  ON_THE_WAY_TO_CUSTOMER = 'ON_THE_WAY_TO_CUSTOMER',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED',
  // Estados específicos para motocicleta (servicio de pasajeros)
  ON_THE_WAY_TO_PICKUP = 'ON_THE_WAY_TO_PICKUP',
  ARRIVED_AT_PICKUP = 'ARRIVED_AT_PICKUP',
  ON_THE_WAY_TO_DESTINATION = 'ON_THE_WAY_TO_DESTINATION',
}

export interface Order {
  id: string;
  orderId: string;
  restaurantName: string;
  dateTime: string;
  paymentMethod: string;
  customer: Customer;
  items: OrderItem[];
  subtotal: number;
  deliveryCost: number;
  total: number;
  customerLocation: Location;
  pickupLocationUrl: string;
  pickupAddress?: string; // Dirección de origen para motocicleta
  deliveryAddress: string;
  customerUrl: string;
  deliveryReferences: string;
  customerCode: string;
  status: OrderStatus;
  assignedToDeliveryId: string;
  assignedToDeliveryName: string;
  candidateDeliveryIds: string[];
  createdAt: number;
  deliveredAt?: number | null;
  deliveredDateTime?: string; // Fecha y hora de entrega formateada
  restaurantMapUrl?: string; // URL de Google Maps del restaurante
  orderType?: 'MANUAL' | 'RESTAURANT'; // Tipo de pedido: Manual o Restaurante
  serviceType?: 'MOTORCYCLE_TAXI' | 'GASOLINE' | 'FOOD' | 'MEDICINES' | 'STATIONERY' | 'BEVERAGES' | 'WATER' | 'GAS' | 'PAYMENTS' | 'FAVORS'; // Tipo de servicio
  distance?: number | string; // Distancia calculada (para motocicleta)
  itemsOriginalString?: string | null; // String original de items para motocicleta (mantiene formato con emojis y saltos de línea)
  additionalNotes?: string; // Notas adicionales del cliente
}

export interface Message {
  id: string;
  senderId: string;
  senderName: string;
  receiverId: string;
  receiverName: string;
  message: string;
  messageType: string;
  timestamp: number;
  isRead: boolean;
}

export enum MessageType {
  TEXT = 'TEXT',
  IMAGE = 'IMAGE',
  LOCATION = 'LOCATION'
}