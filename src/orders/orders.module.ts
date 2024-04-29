import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { TypeOrmModule } from '@nestjs/typeorm';

import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { NATS_SERVICE } from '../common/constants';
import { envs } from '../config/envs';
import { Order, OrderItem, OrderReceipt } from './entities';

@Module({
  controllers: [OrdersController],
  providers: [OrdersService],
  exports: [OrdersService, TypeOrmModule],
  imports: [
    TypeOrmModule.forFeature([Order, OrderItem, OrderReceipt]),
    ClientsModule.register([
      {
        name: NATS_SERVICE,
        transport: Transport.NATS,
        options: {
          servers: envs.natsServers,
        },
      },
    ]),
  ],
})
export class OrdersModule {}
