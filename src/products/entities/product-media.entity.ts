import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  Index,
  Check,
} from 'typeorm';
import { Product } from './products.entity';
import { Exclude } from 'class-transformer';

export enum MediaType {
  IMAGE = 'IMAGE',
  VIDEO = 'VIDEO',
}

@Entity('product_media')
// Database-level check constraints for PostgreSQL
// Ensures dimensions are positive numbers and within reasonable limits (e.g., max 8000px)
@Check(
  'CHK_PRODUCT_IMAGE_DIMENSIONS',
  '"width" > 0 AND "width" <= 8000 AND "height" > 0 AND "height" <= 8000',
)
// Ensures file size is positive and does not exceed 100MB (104,857,600 bytes)
@Check('CHK_PRODUCT_MEDIA_BYTES', '"bytes" > 0 AND "bytes" <= 104857600')
@Index('IDX_UNIQUE_PRIMARY_MEDIA_PER_PRODUCT', ['productId'], {
  unique: true,
  where: '"isPrimary" = true',
})
export class ProductMedia {
  @PrimaryGeneratedColumn()
  id!: number;

  @Index('IDX_PRODUCTS_MEDIA_STORAGE_KEY', { unique: true })
  @Column({ type: 'varchar', length: 500, nullable: false })
  storageKey!: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  altText!: string;

  @Column({ type: 'enum', enum: MediaType, default: MediaType.IMAGE })
  mediaType!: MediaType;

  @Column({ type: 'varchar', length: 10, nullable: false })
  format!: string;

  @Column({ type: 'boolean', default: false })
  isPrimary!: boolean;

  @Column({ type: 'int', nullable: false })
  width!: number;

  @Column({ type: 'int', nullable: false })
  height!: number;

  @Column({ type: 'int', nullable: false })
  bytes!: number;

  // ==================== Relations ====================
  @Index('IDX_PRODUCTS_MEDIA_PRODUCTID')
  @Exclude()
  @Column({ type: 'int', select: false, nullable: false })
  productId!: number;

  @ManyToOne(() => Product, (product) => product.gallery, {
    onDelete: 'CASCADE',
    nullable: false,
  })
  @JoinColumn({ name: 'productId' })
  product!: Product;
}
