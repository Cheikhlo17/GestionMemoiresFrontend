import { Department } from './department.model';

export interface Supervisor {
  id: number;
  title: string | null;
  specialization: string | null;
  max_students: number;
  is_active: boolean;
  first_name: string;
  last_name: string;
  full_name: string;
  email: string;
  phone: string | null;
  department: Department;
  created_at: string;
  updated_at: string;
}