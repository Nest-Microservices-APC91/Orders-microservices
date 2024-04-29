import { HttpStatus, Inject, Injectable, Logger } from '@nestjs/common';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { firstValueFrom } from 'rxjs';

import { CreateOrderDto } from './dto/create-order.dto';
import { OrderPaginationDto } from './dto/order-pagination.dto';
import { ChangeOrderDto } from './dto/changeOrder.dto';
import { NATS_SERVICE, Payments, Products } from '../common/constants';
import { OrderWithProducts } from './interfaces/order-with-products.interface';
import { PaidOrderDto } from './dto/paid-order.dto';
import { Order, OrderItem, OrderReceipt } from './entities';
import { OrderStatus } from './interfaces/order-status.enum';

@Injectable()
export class OrdersService {
  private readonly logger = new Logger('OrdersService');

  constructor(
    @Inject(NATS_SERVICE)
    private readonly client: ClientProxy,

    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,

    @InjectRepository(OrderItem)
    private readonly orderItemRepository: Repository<OrderItem>,

    @InjectRepository(OrderReceipt)
    private readonly orderReceiptRepository: Repository<OrderReceipt>,
  ) {}

  async create({ items }: CreateOrderDto) {
    const productsIds = items.map((item) => item.productId);
    let orderItems: OrderItem[] = [];

    try {
      const products: any[] = await this.validateProduct(productsIds);

      //Monto Total de los productos
      const totalAmount = items.reduce((acc, orderItem) => {
        const price = products.find(
          (produc) => produc.id === orderItem.productId,
        ).price;

        return price * orderItem.quantity + acc;
      }, 0);

      // total de productos
      const totalItems = items.reduce((acc, orderItem) => {
        return acc + orderItem.quantity;
      }, 0);

      const order = this.orderRepository.create({
        totalAmount,
        totalItems,
      });
      await this.orderRepository.save(order);

      const data = items.map((orderItem) => ({
        orderId: order.id,
        productId: orderItem.productId,
        quantity: orderItem.quantity,
        price: products.find((product) => product.id === orderItem.productId)
          .price,
      }));

      data.forEach ( productItem => {
        orderItems.push(this.orderItemRepository.create(productItem));
      })
      await this.orderItemRepository.save(orderItems);

      return {
        ...order,
        OrderItem: orderItems.map((orderItem) => ({
          ...orderItem,
          name: products.find((product) => product.id === orderItem.productId)
            .name,
        })),
      };
    } catch (error) {
      this.logger.error(error.message);
      throw new RpcException({
        status: HttpStatus.BAD_REQUEST,
        message: 'check logs',
      });
    }
  }

  async findAll(orderPaginationDto: OrderPaginationDto) {
    const { limit, page, status } = orderPaginationDto;
    const data = await this.orderRepository.find({
      skip: (page - 1) * limit,
      take: limit,
    });

    const lastPage = Math.ceil(data.length / limit);

    return {
      data,
      meta: {
        total: data.length,
        page,
        lastPage,
      },
    };
  }

 async findAllByStatus(orderPaginationDto: OrderPaginationDto) {
    const { limit, page, status } = orderPaginationDto;
    const data = await this.orderRepository.find({
      where: { status },
      skip: (page - 1) * limit,
      take: limit,
    });

    const lastPage = Math.ceil(data.length / limit);

    return {
      data,
      meta: {
        total: data.length,
        page,
        lastPage,
      },
    };
  }

  async findOne(id: string) {
    const order:Order = await this.orderRepository.findOneBy({id});

    if (!order) {
      throw new RpcException({
        message: `Order with id: ${id} not found`,
        status: HttpStatus.NOT_FOUND,
      });
    }

    const productsId = order.orderItems.map((item) => item.productId);

    const products = await this.validateProduct(productsId);

    const { orderItems, ...rest} = order;
    return {
      ...rest,
      orderItems: orderItems.map((orderItem) => ({
        ...orderItem,
        name: products.find((product) => product.id === orderItem.productId)
          .name,
      })),
    };
  }

  async changeOrdesStatus(changeOrderDto: ChangeOrderDto) {
    const { id, status } = changeOrderDto;

    const order: Order = await this.findOne(id);

    if (order.status === status) return order;

    const updateOrder: Order = {
      ...order,
      status,
      updatedAt: new Date(),
    }
    
    try {
      const orderSaved = await this.orderRepository.save(updateOrder);
      return orderSaved;
    } catch (error) {
      this.logger.error(error.message);
      throw new RpcException({
        status: HttpStatus.BAD_REQUEST,
        message: 'check logs',
      });
    }
  }

   async createPaymentSession(order: OrderWithProducts) {
    try {
      const paymentSession = await firstValueFrom(
        this.client.send(Payments.CREATE_PAYMENT_SESSION, {
          orderId: order.id,
          currency: 'eur',
          items: order.OrderItem.map(({ name, price, quantity }) => ({
            name,
            price,
            quantity,
          })),
        }),
      );

      return paymentSession;
    } catch (error) {
      throw new RpcException({
        status: HttpStatus.BAD_REQUEST,
        message: 'check logs',
      });
    }
  }

  async paidOrder(paidOrderDto: PaidOrderDto) {
    const { orderId, stripePaymentId, receiptUrl } = paidOrderDto;

    const order: Order = await this.findOne(orderId);

    const updateOrder: Order = {
      ...order,
      status: OrderStatus.PAID,
      paid: true,
      paidAt: new Date(),
      updatedAt: new Date(),
      stripeChargeId: stripePaymentId,
    }
    await this.orderRepository.save(updateOrder);

    const orderReceipt = this.orderReceiptRepository.create({
      orderId: updateOrder.id,
      receiptUrl
    })

    await this.orderReceiptRepository.save(orderReceipt);
  
  }

  private async validateProduct(ids: number[]) {
    //Convertir el observable en promesa
    const products: any[] = await firstValueFrom(
      //Buscar y validar productos en el microservico de productos
      this.client.send(Products.VALIDATE_PRODUCTS, ids),
    );
    return products;
  }
}
