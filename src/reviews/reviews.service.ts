import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOneOptions, Repository } from 'typeorm';
import { Review } from './reviews.entity';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { GetReviewsDTO } from './dto/get-reviews.dto';

@Injectable()
export class ReviewsService {
  constructor(
    @InjectRepository(Review)
    private readonly reviewsRepository: Repository<Review>,
  ) {}

  /**
   * Get all reviews
   */
  async findAll() {
    const [items, total] = await this.reviewsRepository.findAndCount({
      order: {
        createdAt: 'DESC',
      },
    });
    return { items, total };
  }

  /**
   * Get all reviews by product id
   */
  async findAllByProductId(productId: number, queryDto: GetReviewsDTO) {
    const { page, limit, sortBy, sortOrder } = queryDto;

    // 1. Query Builder
    const query = this.reviewsRepository
      .createQueryBuilder('review')
      .where('review.productId = :productId', { productId })
      .leftJoin('review.user', 'user')
      .addSelect(['user.id', 'user.username', 'user.email']);

    // 3. Sorting
    query.orderBy(`review.${sortBy}`, sortOrder);

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
   * Get single review by id
   */
  async findOne(id: number, options?: FindOneOptions<Review>): Promise<Review> {
    const review = await this.reviewsRepository.findOne({
      where: { id },
      ...options,
    });

    if (!review) {
      throw new NotFoundException(`Review with ID ${id} not found`);
    }

    return review;
  }

  /**
   * Create new review
   */
  create(userId: number, productId: number, body: CreateReviewDto) {
    const review = this.reviewsRepository.create({
      ...body,
      userId,
      productId,
    });

    return this.reviewsRepository.save(review);
  }

  /**
   * Update existing review
   */
  async update(resource: Review, data: UpdateReviewDto) {
    const review = resource;

    Object.assign(review, data);

    return await this.reviewsRepository.save(review);
  }

  /**
   * Soft delete review
   */
  async remove(id: number): Promise<{ message: string }> {
    await this.reviewsRepository.softDelete(id);
    return { message: `Review ${id} deleted successfully` };
  }

  /**
   * Restore soft deleted review
   */
  async restore(id: number): Promise<{ message: string }> {
    const result = await this.reviewsRepository.restore(id);

    if (!result.affected) {
      throw new NotFoundException(`Deleted review ${id} not found`);
    }

    return {
      message: `Review ${id} restored successfully`,
    };
  }

  /**
   * GET the 3 most recent reviews for a specific product
   */
  async getLatestReviewsByProduct(productId: number): Promise<Review[]> {
    return this.reviewsRepository
      .createQueryBuilder('review')
      .leftJoin('review.user', 'user')
      .addSelect(['user.id', 'user.username'])
      .where('review.productId = :productId', { productId })
      .orderBy('review.createdAt', 'DESC')
      .take(3)
      .getMany();
  }

  /**
   * GET rating statistics for a specific product
   */
  async getReviewStatsByProduct(productId: number) {
    const stats = await this.reviewsRepository
      .createQueryBuilder('review')
      .select('COUNT(review.id)', 'count')
      .addSelect('COALESCE(AVG(review.rating), 0)', 'average')
      .where('review.productId = :productId', { productId })
      .getRawOne();

    return {
      totalReviews: parseInt(stats.count) || 0,
      averageRating: parseFloat(stats.average)?.toFixed(1) || '0.0',
    };
  }
}
