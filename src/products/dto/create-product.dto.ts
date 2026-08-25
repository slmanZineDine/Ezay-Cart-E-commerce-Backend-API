import {
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  MinLength,
  IsInt,
  IsUrl,
  IsArray,
  ArrayMinSize,
  ValidateNested,
  Matches,
} from 'class-validator';

import { Type } from 'class-transformer';
import { Squish } from 'src/common/decorators/squish.decorator';

export class CreateProductDto {
  @Squish()
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(120)
  name!: string;

  @Squish()
  @IsString()
  @IsNotEmpty()
  @MinLength(10)
  @MaxLength(2000)
  description!: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  price!: number; // Cent

  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  isAvailable?: boolean;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateProductImageDto)
  gallery!: CreateProductImageDto[];
}

export class CreateProductImageDto {
  @IsUrl({
    protocols: ['https'],
    require_protocol: true,
  })
  @Matches(/^https:\/\/res\.cloudinary\.com\//, {
    message: 'Image must be hosted on Cloudinary',
  })
  url!: string;

  @Squish()
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  altText!: string;
}
