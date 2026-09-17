import { ThesisStatus } from '../models/thesis.model';

export interface ThesisPayload {
  title: string;
  abstract?: string;
  department_id: number;
  program_id: number;
  academic_year_id: number;
}

export interface ThesisFilters {
  search?: string;
  status?: ThesisStatus | null;
  department_id?: number | null;
  supervisor_id?: number | null;
  student_id?: number | null;
  sort_by?: string;
  sort_direction?: 'asc' | 'desc';
  per_page?: number;
  page?: number;
}

export interface ChangeStatusPayload {
  status: ThesisStatus;
  remarks?: string;
}

export interface AssignSupervisorPayload {
  supervisor_id: number;
}

export interface CommentPayload {
  content: string;
  thesis_version_id?: number | null;
}