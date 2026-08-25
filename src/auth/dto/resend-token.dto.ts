import { ApiProperty } from '@nestjs/swagger';
import { IsEmail } from 'class-validator';

export class ResendTokenDto {
  @ApiProperty()
  @IsEmail({}, { message: 'Invalid email format' })
  email!: string;
}
