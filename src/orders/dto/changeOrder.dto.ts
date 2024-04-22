import { OrderStatus } from '@prisma/client';
import { IsEnum, IsString, IsUUID } from 'class-validator';
import { OrdersStatusList } from './enum/order.enum';

export class ChangeOrderDto {
  @IsString()
  @IsUUID()
  id: string;

  @IsEnum(OrdersStatusList, {
    message: `Valid status are ${OrdersStatusList}`,
  })
  status: OrderStatus;
}
