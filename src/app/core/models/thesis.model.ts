import { AcademicYear } from './academic-year.model';
import { Department } from './department.model';
import { Program } from './program.model';

export type ThesisStatus =
  | 'draft'
  | 'submitted'
  | 'under_review'
  | 'revision_required'
  | 'approved'
  | 'rejected'
  | 'archived';

export interface ThesisStudentSummary {
  id: number;
  full_name: string;
  student_number: string;
}

export interface ThesisSupervisorSummary {
  id: number;
  full_name: string;
  title: string | null;
  specialization: string | null;
}

export interface ThesisVersion {
  id: number;
  version_number: number;
  file_name: string;
  file_size: number;
  mime_type: string;
  notes: string | null;
  uploaded_by: { id: number; full_name: string } | null;
  created_at: string;
}

export interface Comment {
  id: number;
  content: string;
  thesis_version_id: number | null;
  author: { id: number; full_name: string; role: string };
  created_at: string;
}

export interface ThesisStatusHistory {
  id: number;
  from_status: ThesisStatus | null;
  to_status: ThesisStatus;
  remarks: string | null;
  changed_by: { id: number; full_name: string };
  created_at: string;
}

export interface Thesis {
  id: number;
  title: string;
  abstract: string | null;
  status: ThesisStatus;
  submitted_at: string | null;
  approved_at: string | null;
  student: ThesisStudentSummary;
  supervisor: ThesisSupervisorSummary | null;
  department: Department;
  program: Program;
  academic_year: AcademicYear;
  versions: ThesisVersion[];
  comments: Comment[];
  status_histories: ThesisStatusHistory[];
  created_at: string;
  updated_at: string;
}