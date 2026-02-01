export type OrderStatus = 'new' | 'accepted' | 'preparing' | 'ready' | 'picked';
export type PaymentMode = 'COD' | 'Paid';

export interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  customizations?: string[];
}

export interface Order {
  id: string;
  customerName: string;
  items: OrderItem[];
  total: number;
  paymentMode: PaymentMode;
  status: OrderStatus;
  createdAt: Date;
  acceptedAt?: Date;
  preparingAt?: Date;
  readyAt?: Date;
  pickedAt?: Date;
  prepTime?: number; // in minutes
  instructions?: string;
  deliveryPartner?: string;
}

export interface MenuItem {
  id: string;
  name: string;
  price: number;
  description?: string;
  image: string;
  available: boolean;
  category?: string;
  isVeg: boolean;
  isBestseller?: boolean;
}

export interface StoreSettings {
  isOpen: boolean;
  isAcceptingOrders: boolean;
  avgPrepTime: number;
}

export interface DailyStats {
  totalOrders: number;
  completedOrders: number;
  revenue: number;
  avgPrepTime: number;
}
