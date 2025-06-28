import { $Enums } from '../../../generated/prisma';
import UserRole = $Enums.UserRole;

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  phone: string;
  role: UserRole;
  profilePicture: string;
  address: string;
  city: string;
  country: string;
  createdAt: Date;
  updatedAt: Date;
}
