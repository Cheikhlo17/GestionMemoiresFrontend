import { Role } from './role.model';

export interface User {
  id: number;
  first_name: string;
  last_name: string;
  full_name: string;
  email: string;
  phone: string | null;
  avatar: string | null;
  email_verified_at: string | null;
  is_active: boolean;
  last_login_at: string | null;
  role: Role;
  created_at: string;
  updated_at: string;
}