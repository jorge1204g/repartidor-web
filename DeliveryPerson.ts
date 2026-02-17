export interface DeliveryPerson {
  id: string;
  name: string;
  phone: string;
  email: string;
  isApproved: boolean;
  registrationDate: string;
  isOnline: boolean;
  isActive: boolean;
  lastSeen: number;
}