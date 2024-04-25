import {
  HttpStatus,
  Inject,
  Injectable,
  Logger,
  OnModuleInit,
} from '@nestjs/common';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { PrismaClient } from '@prisma/client';
import { firstValueFrom } from 'rxjs';

import { CreateOrderDto } from './dto/create-order.dto';
import { OrderPaginationDto } from './dto/order-pagination.dto';
import { ChangeOrderDto } from './dto/changeOrder.dto';
import { NATS_SERVICE, Payments, Products } from '../common/constants';
import { OrderWithProducts } from './interfaces/order-with-products.interface';
import { PaidOrderDto } from './dto/paid-order.dto';

@Injectable()
export class OrdersService extends PrismaClient implements OnModuleInit {
  private readonly logger = new Logger('OrdersService');

  @Inject(NATS_SERVICE)
  private readonly client: ClientProxy;

  onModuleInit() {
    this.$connect();
    this.logger.log('Database connected');
  }

  async create({ items }: CreateOrderDto) {
    const productsIds = items.map((item) => item.productId);

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

      const order = await this.order.create({
        data: {
          totalAmount,
          totalItems,
          OrderItem: {
            createMany: {
              data: items.map((orderItem) => ({
                productId: orderItem.productId,
                quantity: orderItem.quantity,
                price: products.find(
                  (product) => product.id === orderItem.productId,
                ).price,
              })),
            },
          },
        },
        include: {
          OrderItem: {
            select: {
              price: true,
              quantity: true,
              productId: true,
            },
          },
        },
      });

      return {
        ...order,
        OrderItem: order.OrderItem.map((orderItem) => ({
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
    const totalPage = await this.order.count({ where: { status } });
    const lastPage = Math.ceil(totalPage / limit);

    return {
      data: await this.order.findMany({
        where: { status },
        skip: (page - 1) * limit,
        take: limit,
      }),
      meta: {
        total: totalPage,
        page,
        lastPage,
      },
    };
  }

  async findAllByStatus(orderPaginationDto: OrderPaginationDto) {
    const { limit, page, status } = orderPaginationDto;
    const totalPage = await this.order.count({ where: { status } });
    const lastPage = Math.ceil(totalPage / limit);

    return {
      data: await this.order.findMany({
        where: { status },
        skip: (page - 1) * limit,
        take: limit,
      }),
      meta: {
        total: totalPage,
        page,
        lastPage,
      },
    };
  }

  async findOne(id: string) {
    const order = await this.order.findUnique({
      where: { id },
      include: {
        OrderItem: {
          select: {
            price: true,
            quantity: true,
            productId: true,
          },
        },
      },
    });

    if (!order) {
      throw new RpcException({
        message: `Order with id: ${id} not found`,
        status: HttpStatus.NOT_FOUND,
      });
    }

    const productsId = order.OrderItem.map((item) => item.productId);

    const products = await this.validateProduct(productsId);

    return {
      ...order,
      OrderItem: order.OrderItem.map((orderItem) => ({
        ...orderItem,
        name: products.find((product) => product.id === orderItem.productId)
          .name,
      })),
    };
  }

  async changeOrdesStatus(changeOrderDto: ChangeOrderDto) {
    const { id, status } = changeOrderDto;

    const order = await this.findOne(id);

    if (order.status === status) return order;

    const updateOrder = await this.order.update({
      where: { id: order.id },
      data: { status },
    });

    return updateOrder;
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
    await this.order.update({
      where: { id: paidOrderDto.orderId },
      data: {
        status: 'PAID',
        paid: true,
        paidAt: new Date(),
        stripeChargeId: paidOrderDto.stripePaymentId,

        // La relación
        OrderReceipt: {
          create: {
            receiptUrl: paidOrderDto.receiptUrl,
          },
        },
      },
    });
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
