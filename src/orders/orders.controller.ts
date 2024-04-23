import { Controller, ParseUUIDPipe } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { Orders } from '../common';
import { OrderPaginationDto } from './dto/order-pagination.dto';
import { ChangeOrderDto } from './dto/changeOrder.dto';

@Controller()
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @MessagePattern(Orders.CREATE)
  create(@Payload() createOrderDto: CreateOrderDto) {
    return this.ordersService.create(createOrderDto);
  }

  @MessagePattern(Orders.FIND_ALL)
  findAll(@Payload() orderPaginationDto: OrderPaginationDto) {
    return this.ordersService.findAll(orderPaginationDto);
  }

  @MessagePattern(Orders.FIND_ALL_BY_STATUS)
  findAllByStatus(@Payload() orderPaginationDto: OrderPaginationDto) {
    return this.ordersService.findAllByStatus(orderPaginationDto);
  }

  @MessagePattern(Orders.FIND_ONE)
  findOne(@Payload('id', ParseUUIDPipe) id: string) {
    return this.ordersService.findOne(id);
  }

  @MessagePattern(Orders.CHANGE_ORDER_STATUS)
  changeOrdesStatus(@Payload() changeOrderDto: ChangeOrderDto) {
    return this.ordersService.changeOrdesStatus(changeOrderDto);
  }
}
