export interface ArchiveFilters {
  search?: string;
  academic_year_id?: number | null;
  program_id?: number | null;
  department_id?: number | null;
  degree_level?: string | null;
  supervisor_id?: number | null;
  defense_year?: number | null;
  visibility?: 'public' | 'private' | null;
  per_page?: number;
  page?: number;
}

export interface ArchiveThesisPayload {
  thesis_version_id?: number;
  keywords?: string[];
  visibility?: 'public' | 'private';
  show_final_grade?: boolean;
}

export interface UpdateArchivePayload {
  keywords?: string[];
  visibility?: 'public' | 'private';
  show_final_grade?: boolean;
}

export interface EligibilityResult {
  eligible: boolean;
  reasons: string[];
}