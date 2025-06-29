import { CreateUserDto, UpdateUserDto } from '../dtos';
import { $Enums } from '../../../generated/prisma';

export type UserRole = $Enums.UserRole;

export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  phone: string | null;
  profilePicture: string | null;
  city: string | null;
  country: string | null;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserResponse {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  profilePicture: string | null;
  city: string | null;
  country: string | null;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}

export interface IuserService {
  create(dto: CreateUserDto): Promise<UserResponse>;

  findAll(): Promise<UserResponse[]>;

  findOne(id: string): Promise<UserResponse>;

  findByEmail(email: string): Promise<User | null>;

  update(id: string, updateUserDto: UpdateUserDto): Promise<UserResponse>;

  remove(id: string): Promise<void>;

  resetPassword(email: string): Promise<void>;
}
