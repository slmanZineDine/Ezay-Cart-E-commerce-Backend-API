import { UserRole } from '../../utils/enums';

export interface JwtPayload {
  sub: number;
  email: string;
  role: UserRole;
  familyId: string;
}
