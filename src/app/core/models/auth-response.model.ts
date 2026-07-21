import { User } from './user.model';

export interface AuthResponse {
  user: User;
  token: string;
  token_type: string;
}

export interface ApiSuccessResponse<T> {
  message: string;
  data: T;
}

export interface ApiErrorResponse {
  message: string;
  errors?: Record<string, string[]>;
}