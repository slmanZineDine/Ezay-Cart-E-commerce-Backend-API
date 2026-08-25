import { UserRole } from 'src/utils/enums';

export interface JwtPayload {
  sub: number;
  email: string;
  role: UserRole;
  familyId: string;
}
