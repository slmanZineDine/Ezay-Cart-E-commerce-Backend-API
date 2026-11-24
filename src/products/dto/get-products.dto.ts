import { Type } from 'class-transformer';
import {
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsGreaterThan } from '../../common/decorators/is-greater-than.decorator';
import { Squish } from '../../common/decorators/squish.decorator';
import { ProductSortBy, SortOrder } from '../../utils/enums';

export class GetProductsDTO {
  @ApiPropertyOptional({
    description: 'Search term to filter products by name (case-insensitive)',
    minLength: 3,
    maxLength: 120,
  })
  @IsOptional()
  @Squish()
  @IsString()
  @MinLength(3)
  @MaxLength(120)
  name?: string;

  @ApiPropertyOptional({
    description: 'Filter products belonging to a specific owner/user',
    minimum: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  userId?: number;

  @ApiPropertyOptional({
    description: 'Minimum price threshold in cents (e.g., 1000 = $10.00)',
    minimum: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(1)
  minPrice?: number;

  @ApiPropertyOptional({
    description: 'Maximum price threshold in cents (e.g., 50000 = $500.00)',
    minimum: 1,
    maximum: 100_000_000,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(1)
  @Max(1_000_000)
  @IsGreaterThan('minPrice', {
    message: 'maxPrice must be greater than or equal to minPrice',
  })
  maxPrice?: number;

  // ==================== pagination ====================
  @ApiPropertyOptional({
    minimum: 1,
    default: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page = 1;

  @ApiPropertyOptional({
    minimum: 1,
    maximum: 100,
    default: 10,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit = 10;

  // ==================== sorting ====================
  @ApiPropertyOptional({
    enum: ProductSortBy,
    default: ProductSortBy.CREATED_AT,
  })
  @IsOptional()
  @IsEnum(ProductSortBy, { message: 'Invalid sortBy value' })
  sortBy = ProductSortBy.CREATED_AT;

  @ApiPropertyOptional({
    enum: SortOrder,
    default: SortOrder.ASC,
  })
  @IsOptional()
  @IsEnum(SortOrder, { message: 'Invalid sortOrder value' })
  sortOrder = SortOrder.ASC;
}
