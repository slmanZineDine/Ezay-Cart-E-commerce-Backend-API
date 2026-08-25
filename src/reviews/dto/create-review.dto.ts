import { Type } from 'class-transformer';
import {
  IsString,
  IsNotEmpty,
  IsInt,
  Min,
  Max,
  MinLength,
  MaxLength,
} from 'class-validator';
import { Squish } from 'src/common/decorators/squish.decorator';

export class CreateReviewDto {
  @Squish()
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(255)
  comment!: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(5)
  rating!: number;
}
