export interface ThesisArchivePublic {
  id: number;
  title: string;
  abstract: string | null;
  keywords: string[] | null;
  student_name: string;
  supervisor_name: string | null;
  department: string;
  program: string;
  degree_level: 'bachelor' | 'master' | 'phd';
  academic_year: string;
  jury_members: string[];
  defense_date: string | null;
  final_grade: number | null;
  archived_at: string;
  can_download: boolean;
}

export interface ThesisArchiveAdmin extends ThesisArchivePublic {
  thesis_id: number;
  visibility: 'public' | 'private';
  show_final_grade: boolean;
  verdict: string | null;
  final_version: { id: number; file_name: string };
  archived_by: string;
  created_at: string;
  updated_at: string;
}