import { ApiProperty } from '@nestjs/swagger';
import { IsEmail } from 'class-validator';

export class ForgotPasswordDto {
  @ApiProperty({
    writeOnly: true,
  })
  @IsEmail({}, { message: 'Invalid email format' })
  email!: string;
}
