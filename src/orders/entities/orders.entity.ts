import {
  Column,
  Entity,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { OrderStatus } from '../interfaces/order-status.enum';
import { OrderItem } from './order-item.entity';
import { OrderReceipt } from './order-receipt.entity';

@Entity({ name: 'orders' })
export class Order {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('float', { default: 0 })
  totalAmount: number;

  @Column('int', { default: 0 })
  totalItems: number;

  @Column({
    type: 'enum',
    enum: OrderStatus,
    default: [OrderStatus.PENDING],
  })
  status: OrderStatus;

  @Column({
    type: 'boolean',
    default: false,
  })
  paid: boolean;

  @Column({
    type: 'timestamp',
    default: new Date(),
    nullable: true,
  })
  paidAt?: Date;

  @Column({
    type: 'varchar',
    nullable: true,
  })
  stripeChargeId?: string;

  @Column({
    type: 'timestamp',
    default: new Date(),
  })
  createdAt: Date;

  @Column({
    type: 'timestamp',
    default: new Date(),
  })
  updatedAt: Date;

  @OneToMany(() => OrderItem, (orderItem) => orderItem.order, { eager: true })
  orderItems: OrderItem[];

  @OneToOne(() => OrderReceipt, (orderReceipt) => orderReceipt.order)
  orderReceipt: OrderReceipt;
}
