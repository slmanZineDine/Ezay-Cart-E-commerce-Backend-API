import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOneOptions, Repository } from 'typeorm';
import { Product } from './entities/products.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { GetProductsDTO } from './dto/get-products.dto';
import { ReviewsService } from '../reviews/reviews.service';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productsRepository: Repository<Product>,
    private readonly reviewsService: ReviewsService,
  ) {}

  /**
   * Get all active (not soft deleted) products
   */
  async findAll(queryDto: GetProductsDTO) {
    const { name, userId, minPrice, maxPrice, page, limit, sortBy, sortOrder } =
      queryDto;

    // 1. Query Builder
    const query = this.productsRepository
      .createQueryBuilder('product')
      .leftJoin('product.user', 'user')
      .addSelect(['user.id', 'user.username', 'user.email']);

    // 2. Dynamic Filters
    if (name) {
      query.andWhere('product.name ILIKE :name', { name: `%${name}%` });
    }

    if (userId) {
      query.andWhere('user.id = :userId', { userId });
    }

    if (minPrice) {
      query.andWhere('product.price >= :minPrice', { minPrice });
    }

    if (maxPrice) {
      query.andWhere('product.price <= :maxPrice', { maxPrice });
    }

    // 3. Sorting
    query.orderBy(`product.${sortBy}`, sortOrder);

    // 4. Pagination
    const skip = (page - 1) * limit;
    query.skip(skip).take(limit);

    const [items, total] = await query.getManyAndCount();

    return {
      items,
      total,
    };
  }

  /**
   * Get single product by id
   */
  async findOne(
    id: number,
    options?: FindOneOptions<Product>,
  ): Promise<Product> {
    const product = await this.productsRepository.findOne({
      where: { id },
      ...options,
    });

    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    return product;
  }

  /**
   * Get single product details with reviews by id
   */
  async findProductDetails(id: number) {
    const product = await this.findOne(id, {
      relations: {
        user: true,
      },
      select: {
        user: { id: true, username: true, email: true },
      },
    });

    const latestReviews =
      await this.reviewsService.getLatestReviewsByProduct(id);
    const reviewsStats = await this.reviewsService.getReviewStatsByProduct(id);

    (product as any).reviewsStats = reviewsStats;
    (product as any).latestReviews = latestReviews;

    return product;
  }

  /**
   * Create new product
   */
  async create(data: CreateProductDto, userId: number) {
    const product = this.productsRepository.create({
      ...data,
      userId,
    });

    return this.productsRepository.save(product);
  }

  /**
   * Update existing product
   */
  async update(resource: Product, data: UpdateProductDto) {
    const product = resource;

    Object.assign(product, data);

    return this.productsRepository.save(product);
  }

  /**
   * Soft delete product
   */
  async remove(id: number): Promise<{ message: string }> {
    await this.productsRepository.softDelete(id);
    return { message: `Item ${id} deleted successfully` };
  }

  /**
   * Restore soft deleted product (nice bonus endpoint)
   */
  async restore(id: number): Promise<{ message: string }> {
    const result = await this.productsRepository.restore(id);

    if (!result.affected) {
      throw new NotFoundException(`Deleted product ${id} not found`);
    }

    return {
      message: `Product ${id} restored successfully`,
    };
  }
}
