import {
  Controller,
  Get,
  Patch,
  Delete,
  Param,
  Body,
  ParseIntPipe,
  UseInterceptors,
  UseGuards,
} from '@nestjs/common';
import { UpdateReviewDto } from './dto/update-review.dto';
import { ReviewsService } from './reviews.service';
import { PaginationInterceptor } from '../common/interceptors/pagination.interceptor';
import { CreateOwnershipGuard } from '../auth/guards/ownership.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Review } from './reviews.entity';
import { CurrentResource } from '../auth/decorators/current-resource.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../utils/enums';
import { RolesGuard } from '../auth/guards/roles.guard';
import { ApiBearerAuth } from '@nestjs/swagger';

@Controller('reviews')
@ApiBearerAuth()
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  // GET /reviews
  @Get()
  @Roles(UserRole.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @UseInterceptors(PaginationInterceptor)
  getAll() {
    return this.reviewsService.findAll();
  }

  // GET /reviews/:id
  @Get(':id')
  @Roles(UserRole.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  getById(@Param('id', ParseIntPipe) id: number) {
    return this.reviewsService.findOne(id);
  }

  // PATCH /reviews/:id
  @Patch(':id')
  @UseGuards(JwtAuthGuard, CreateOwnershipGuard(ReviewsService))
  update(@Body() body: UpdateReviewDto, @CurrentResource() resource: Review) {
    return this.reviewsService.update(resource, body);
  }

  // DELETE /reviews/:id
  @Delete(':id')
  @UseGuards(JwtAuthGuard, CreateOwnershipGuard(ReviewsService))
  delete(@Param('id', ParseIntPipe) id: number) {
    return this.reviewsService.remove(id);
  }
}
