import { Module } from '@nestjs/common';
import { OrdersModule } from './orders/orders.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { envs } from './config/envs';

@Module({
  controllers: [],
  providers: [],
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: envs.dbUrl,
      autoLoadEntities: true,
      synchronize: true,
      ssl: true,
      /*  extra: {
        ssl: {
          rejectUnauthorized: false,    no en production
        }
      } */
    }),

    OrdersModule,
  ],
})
export class AppModule {}
