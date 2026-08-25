import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User } from 'src/users/users.entity';

@Injectable()
export class TokensService {
  constructor(private readonly jwtService: JwtService) {}

  // Generate an access token for the user's current session
  generateAccessToken(user: User, familyId: string): string {
    return this.jwtService.sign({
      sub: user.id,
      email: user.email,
      role: user.role,
      familyId,
    });
  }
}
