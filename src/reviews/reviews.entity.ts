import { Exclude } from 'class-transformer';
import { Product } from '../products/entities/products.entity';
import { User } from '../users/users.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  Index,
  JoinColumn,
} from 'typeorm';

@Entity('reviews')
@Index('IDX_REVIEW_PRODUCT_CREATED', ['productId', 'createdAt'])
export class Review {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({
    type: 'varchar',
    length: 255,
    nullable: false,
  })
  comment!: string;

  @Column({
    type: 'int',
    unsigned: true,
    nullable: false,
  })
  rating!: number;

  // ==================== Relations ====================
  @Index('IDX_REVIEW_USERID')
  @Exclude()
  @Column({ type: 'int', nullable: false })
  userId!: number;

  @ManyToOne(() => User, (user) => user.reviews, {
    onDelete: 'CASCADE',
    nullable: false,
  })
  @JoinColumn({ name: 'userId' })
  user!: User;

  @Column({ type: 'int', select: false, nullable: false })
  productId!: number;

  @ManyToOne(() => Product, (product) => product.reviews, {
    onDelete: 'CASCADE',
    nullable: false,
  })
  @JoinColumn({ name: 'productId' })
  product!: Product;

  // ==================== Timestamps ====================
  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @DeleteDateColumn({ select: false })
  deletedAt!: Date;
}
