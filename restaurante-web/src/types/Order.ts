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
}

export interface Order {
  id: string;
  orderId: string;
  restaurantName: string;
  dateTime: string;
  paymentMethod: string;
  customer: {
    name: string;
    phone: string;
    address: string;
    location: {
      latitude: number;
      longitude: number;
    };
  };
  items: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
  subtotal: number;
  deliveryCost: number;
  total: number;
  customerLocation: {
    latitude: number;
    longitude: number;
  };
  pickupLocationUrl: string;
  deliveryAddress: string;
  customerUrl: string; // URL de Google Maps
  deliveryReferences: string;
  customerCode: string;
  status: OrderStatus;
  assignedToDeliveryId: string;
  assignedToDeliveryName: string;
  candidateDeliveryIds: string[];
  createdAt: number;
  deliveredAt: number | null;
  orderType?: 'MANUAL' | 'RESTAURANT'; // Tipo de pedido
}