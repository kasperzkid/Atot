import { MenuItem } from '@/data/menuData';

export type OrderStatus = 'PENDING' | 'PREPARING' | 'READY' | 'DELIVERED' | 'PAYMENT_PENDING';

export type PaymentMethod = 'CASH' | 'CARD' | 'ONLINE' | 'NONE';

export interface OrderItem extends MenuItem {
  qty: number;
}

export interface Order {
  id: string;
  customerName: string;
  tableNumber?: string;
  type: 'DINE-IN' | 'TAKEAWAY' | 'DELIVERY';
  items: OrderItem[];
  status: OrderStatus;
  orderTime: number; // timestamp
  elapsedTime: number; // minutes
  totalPrice: number;
  notes?: string;
  paymentMethod: PaymentMethod;
  paymentStatus: 'UNPAID' | 'PAID';
  lastStatusChange: number; // timestamp
}

export interface StaffProfile {
  id: string;
  name: string;
  role: 'MANAGER' | 'WAITER' | 'KITCHEN' | 'CASHIER';
  pin: string;
}

export interface DashboardSettings {
  restaurantName: string;
  currency: string;
  timezone: string;
  telegramToken?: string;
  telegramChatId?: string;
  autoSendReport: boolean;
  soundAlerts: boolean;
}
