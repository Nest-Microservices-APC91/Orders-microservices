import { Controller, ParseUUIDPipe } from '@nestjs/common';
import { EventPattern, MessagePattern, Payload } from '@nestjs/microservices';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { Orders, Payments } from '../common';
import { OrderPaginationDto } from './dto/order-pagination.dto';
import { ChangeOrderDto } from './dto/changeOrder.dto';
import { PaidOrderDto } from './dto/paid-order.dto';

@Controller()
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @MessagePattern(Orders.CREATE)
  async create(@Payload() createOrderDto: CreateOrderDto) {
    const order = await this.ordersService.create(createOrderDto);
    const paymentSession = await this.ordersService.createPaymentSession(order);
    return {
      order,
      paymentSession,
    };
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

  @EventPattern(Payments.PAYMENT_SUCCEEDED)
  paidOrder(@Payload() paidOrderDto: PaidOrderDto) {
    return this.ordersService.paidOrder(paidOrderDto);
  }
}
