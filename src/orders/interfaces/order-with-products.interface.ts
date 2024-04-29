import { OrderStatus } from './order-status.enum';

export interface OrderWithProducts {
  OrderItem: {
    name: string;
    productId: number;
    quantity: number;
    price: number;
    orderId: string;
    id: string;
  }[];
  id: string;
  totalAmount: number;
  totalItems: number;
  status: OrderStatus;
  paid: boolean;
  paidAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}
