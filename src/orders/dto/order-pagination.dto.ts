import { IsEnum, IsOptional } from 'class-validator';
import { OrdersStatusList } from './enum/order.enum';
import { PaginationDto } from '../../common';
import { OrderStatus } from '../interfaces/order-status.enum';

export class OrderPaginationDto extends PaginationDto {
  @IsOptional()
  @IsEnum(OrdersStatusList, {
    message: `Valid status are ${OrdersStatusList}`,
  })
  status: OrderStatus;
}
