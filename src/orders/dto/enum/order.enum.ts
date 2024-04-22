import { OrderStatus } from '@prisma/client';

export const OrdersStatusList = [
  OrderStatus.PENDING,
  OrderStatus.CANCELLED,
  OrderStatus.DELIVERED,
];
