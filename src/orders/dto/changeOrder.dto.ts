
import { IsEnum, IsString, IsUUID } from 'class-validator';
import { OrdersStatusList } from './enum/order.enum';
import { OrderStatus } from '../interfaces/order-status.enum';

export class ChangeOrderDto {
  @IsString()
  @IsUUID()
  id: string;

  @IsEnum(OrdersStatusList, {
    message: `Valid status are ${OrdersStatusList}`,
  })
  status: OrderStatus;
}
