import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsNumber, IsOptional, Max, Min } from 'class-validator';

import { ProductSortBy, SortOrder } from 'src/utils/enums';

export class GetReviewsDTO {
  // ==================== pagination ====================
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit = 10;

  // ==================== sorting ====================
  @IsOptional()
  @IsEnum(ProductSortBy, { message: 'Invalid sortBy value' })
  sortBy = ProductSortBy.CREATED_AT;

  @IsOptional()
  @IsEnum(SortOrder, { message: 'Invalid sortOrder value' })
  sortOrder = SortOrder.ASC;
}
