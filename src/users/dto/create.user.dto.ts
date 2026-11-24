import {
  IsEmail,
  IsString,
  MinLength,
  MaxLength,
  IsEnum,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '../../utils/enums';

export class CreateUserDto {
  @ApiProperty()
  @IsEmail({}, { message: 'Invalid email format' })
  email!: string;

  @ApiProperty({
    writeOnly: true,
  })
  @IsString({ message: 'Password must be a string' })
  @MinLength(8, { message: 'Password must be at least 8 characters' })
  @MaxLength(50, { message: 'Password is too long' })
  password!: string;

  @ApiProperty({
    enum: UserRole,
  })
  @IsEnum(UserRole, { message: 'Invalid role value' })
  role!: UserRole;
}
