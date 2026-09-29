// src/app/core/models/user-list.model.ts
import { Role } from './role.model';

export interface UserListItem {
  id: number;
  full_name: string;
  email: string;
  is_active: boolean;
  email_verified_at: string | null;
  role: Role;
  created_at: string;
}