import { AuthUser } from './auth-user.interface';
import { Request } from 'express';

export interface AuthRequest extends Request {
  user: AuthUser;
}
