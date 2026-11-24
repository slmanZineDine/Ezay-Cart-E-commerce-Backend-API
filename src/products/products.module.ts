import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from './entities/products.entity';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { ReviewsModule } from '../reviews/reviews.module';

@Module({
  imports: [TypeOrmModule.forFeature([Product]), ReviewsModule],
  controllers: [ProductsController],
  providers: [ProductsService],
})
export class ProductsModule {}
