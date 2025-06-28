import { UserResponse } from './user.interface';

export class CreateUserResponseDto {
  message: string;
  user: UserResponse;
}

export class GetUsersResponseDto {
  message: string;
  users: UserResponse[];
  count: number;
}

export class GetUserResponseDto {
  message: string;
  user: UserResponse;
}

export class UpdateUserResponseDto {
  message: string;
  user: UserResponse;
}

export class PasswordResetResponseDto {
  message: string;
}

export class ChangePasswordResponseDto {
  message: string;
}

export class ErrorResponseDto {
  statusCode: number;
  message: string;
  error?: string;
}
