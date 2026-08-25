import { Exclude } from 'class-transformer';
import { Product } from '../products/entities/products.entity';
import { Review } from '../reviews/reviews.entity';
import { UserRole } from '../utils/enums';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  DeleteDateColumn,
  OneToOne,
} from 'typeorm';
import { AuthToken } from '../auth/entities/auth-tokens.entity';
import { RefreshToken } from '../auth/entities/refresh-tokens.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'varchar', length: 100, nullable: false })
  username!: string;

  @Column({ type: 'varchar', length: 100, unique: true, nullable: false })
  email!: string;

  @Column({ type: 'text', select: false, nullable: false })
  @Exclude()
  password!: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.USER,
    nullable: false,
  })
  role!: UserRole;

  @Column({
    type: 'boolean',
    default: false,
    nullable: false,
  })
  emailVerified!: boolean;

  // ==================== Relations ====================
  @OneToMany(() => Product, (product) => product.user)
  products!: Product[];

  @OneToMany(() => Review, (review) => review.user)
  reviews!: Review[];

  @OneToMany(() => AuthToken, (authToken) => authToken.user)
  authToken!: AuthToken[];

  @OneToMany(
    () => RefreshToken,
    (refreshTokenRefreshToken) => refreshTokenRefreshToken.user,
  )
  refreshToken!: AuthToken[];

  // ==================== Timestamps ====================
  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @DeleteDateColumn({ select: false })
  deletedAt!: Date;
}
