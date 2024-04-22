import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';

import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { Microservices } from '../common/constants';
import { envs } from '../config/envs';

@Module({
  controllers: [OrdersController],
  providers: [OrdersService],
  exports: [OrdersService],
  imports: [
    ClientsModule.register([
      {
        name: Microservices.PRODUCT_SERVICE,
        transport: Transport.TCP,
        options: {
          host: envs.productsMsHost,
          port: envs.productMsPort,
        },
      },
    ]),
  ],
})
export class OrdersModule {}
