export type ThesisSubjectStatus =
  | 'draft'
  | 'submitted'
  | 'under_review'
  | 'accepted'
  | 'rejected'
  | 'published';

export interface ThesisSubject {
  id: number;
  title: string;
  problem_statement: string | null;
  objectives: string | null;
  keywords: string[] | null;
  additional_information: string | null;
  status: ThesisSubjectStatus;
  decision_reason: string | null;
  created_at: string;
  updated_at: string;
  department?: { id: number; name: string };
  student?: { id: number; full_name?: string };
  reviewer?: { id: number; full_name?: string } | null;
}

export interface ThesisSubjectPayload {
  title?: string;
  problem_statement?: string | null;
  objectives?: string | null;
  keywords?: string[];
  additional_information?: string | null;
}

export interface ThesisSubjectFilters {
  status?: ThesisSubjectStatus;
  department_id?: number;
  per_page?: number;
  page?: number;
}
