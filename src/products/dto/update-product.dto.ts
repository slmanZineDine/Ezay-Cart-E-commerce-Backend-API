import { PartialType } from '@nestjs/mapped-types';

import { CreateProductDto, CreateProductImageDto } from './create-product.dto';
import {
  ArrayMinSize,
  IsArray,
  IsInt,
  IsOptional,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateProductDto extends PartialType(CreateProductDto) {
  @IsOptional()
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => UpdateProductImageDto)
  gallery?: UpdateProductImageDto[];
}

export class UpdateProductImageDto extends CreateProductImageDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  id?: number;
}
