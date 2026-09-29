export interface DepartmentDetail {
  id: number;
  name: string;
  code: string;
  is_active: boolean;
  head_of_department: { id: number; full_name: string } | null;
  programs_count: number;
  students_count: number;
  created_at: string;
  updated_at: string;
}