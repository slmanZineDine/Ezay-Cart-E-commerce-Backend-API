import { Exclude } from 'class-transformer';
import { Review } from '../../reviews/reviews.entity';
import { User } from '../../users/users.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  OneToMany,
  ManyToOne,
  JoinColumn,
  Index,
  Check,
} from 'typeorm';
import { ProductMedia } from './product-media.entity';

@Entity('products')
@Check(`"price" >= 0`) // Enforce non-negative price at the database level
export class Product {
  @PrimaryGeneratedColumn('increment')
  id!: number;

  // ⚠️ Warning: This field is indexed via GIN (pg_trgm) in the Migration file.
  // We added this line only to trick TypeORM into not deleting the custom index in the database
  @Index('idx_products_name_trgm')
  @Column({
    type: 'varchar',
    length: 255,
    nullable: false,
  })
  name!: string;

  @Column({
    type: 'text',
    nullable: false,
  })
  description!: string;

  @Index()
  @Column({
    type: 'int',
    nullable: false,
  })
  price!: number;

  @Column({ type: 'boolean', default: true, nullable: false })
  isAvailable!: boolean;

  // ==================== Relations ====================
  @Index()
  @Exclude()
  @Column({ type: 'int', nullable: false })
  userId!: number;

  @ManyToOne(() => User, (user) => user.products, {
    onDelete: 'CASCADE',
    nullable: false,
  })
  @JoinColumn({ name: 'userId' })
  user!: User;

  @OneToMany(() => Review, (review) => review.product)
  reviews!: Review[];

  @OneToMany(() => ProductMedia, (media) => media.product, {
    cascade: ['insert', 'update'],
    orphanedRowAction: 'delete',
  })
  gallery!: ProductMedia[];

  // ==================== Timestamps ====================
  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @DeleteDateColumn({ select: false })
  deletedAt!: Date | null;
}
