import { AcademicYear } from './academic-year.model';
import { Department } from './department.model';
import { Program } from './program.model';

export type StudentStatus = 'active' | 'graduated' | 'suspended' | 'withdrawn';

export interface Student {
  id: number;
  student_number: string;
  enrollment_date: string;
  status: StudentStatus;
  first_name: string;
  last_name: string;
  full_name: string;
  email: string;
  phone: string | null;
  department: Department;
  program: Program;
  academic_year: AcademicYear;
  created_at: string;
  updated_at: string;
}