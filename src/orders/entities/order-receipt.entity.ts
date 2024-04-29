import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { Order } from './orders.entity';

@Entity()
export class OrderReceipt {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', unique: true })
  orderId: string;

  @Column({ type: 'text' })
  receiptUrl: string;

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

  @OneToOne(() => Order)
  @JoinColumn()
  order: Order;
}
