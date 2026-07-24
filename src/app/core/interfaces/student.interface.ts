import { StudentStatus } from '../models/student.model';

export interface StudentPayload {
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
  password?: string;
  department_id: number;
  program_id: number;
  academic_year_id: number;
  student_number: string;
  enrollment_date: string;
  status?: StudentStatus;
}

export interface StudentFilters {
  search?: string;
  department_id?: number | null;
  program_id?: number | null;
  academic_year_id?: number | null;
  status?: StudentStatus | null;
  sort_by?: string;
  sort_direction?: 'asc' | 'desc';
  per_page?: number;
  page?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}