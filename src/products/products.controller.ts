import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  ParseIntPipe,
  UseGuards,
  Query,
  UseInterceptors,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import type { JwtPayload } from 'src/auth/interfaces/jwt-payload.interface';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { GetProductsDTO } from './dto/get-products.dto';
import { PaginationInterceptor } from 'src/common/interceptors/pagination.interceptor';
import { ReviewsService } from 'src/reviews/reviews.service';
import { GetReviewsDTO } from 'src/reviews/dto/get-reviews.dto';
import { CreateReviewDto } from 'src/reviews/dto/create-review.dto';
import { CreateOwnershipGuard } from 'src/auth/guards/ownership.guard';
import { CurrentResource } from 'src/auth/decorators/current-resource.decorator';
import { Product } from './entities/products.entity';
import { ApiBearerAuth } from '@nestjs/swagger';

@Controller('products')
export class ProductsController {
  constructor(
    private readonly productsService: ProductsService,
    private readonly reviewsService: ReviewsService,
  ) {}

  // GET /products
  @Get()
  @UseInterceptors(PaginationInterceptor)
  getAll(@Query() query: GetProductsDTO) {
    return this.productsService.findAll(query);
  }

  // GET /products/:id
  @Get(':id')
  getById(@Param('id', ParseIntPipe) id: number) {
    return this.productsService.findProductDetails(id);
  }

  //  GET /products/:productId/reviews
  @Get(':productId/reviews')
  @UseInterceptors(PaginationInterceptor)
  getProductReviews(
    @Param('productId', ParseIntPipe) productId: number,
    @Query() query: GetReviewsDTO,
  ) {
    return this.reviewsService.findAllByProductId(productId, query);
  }

  // POST /products
  @Post()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  create(@Body() body: CreateProductDto, @CurrentUser() user: JwtPayload) {
    return this.productsService.create(body, user.sub);
  }

  //  POST /products/:productId/reviews
  @Post(':productId/reviews')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  createReview(
    @CurrentUser() user: JwtPayload,
    @Param('productId', ParseIntPipe) productId: number,
    @Body() body: CreateReviewDto,
  ) {
    return this.reviewsService.create(user.sub, productId, body);
  }

  // PATCH /products/:id
  @Patch(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, CreateOwnershipGuard(ProductsService))
  update(@Body() body: UpdateProductDto, @CurrentResource() resource: Product) {
    return this.productsService.update(resource, body);
  }

  // DELETE /products/:id
  @Delete(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, CreateOwnershipGuard(ProductsService))
  delete(@Param('id', ParseIntPipe) id: number) {
    return this.productsService.remove(id);
  }
}
