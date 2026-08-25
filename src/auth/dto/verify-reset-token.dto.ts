import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, Matches } from 'class-validator';

export class VerifyResetTokenDto {
  @ApiProperty({
    writeOnly: true,
  })
  @IsString()
  @Matches(/^\d{6}$/, {
    message: 'Token must be exactly 6 digits',
  })
  token!: string;

  @ApiProperty()
  @IsEmail({}, { message: 'Invalid email format' })
  email!: string;
}
