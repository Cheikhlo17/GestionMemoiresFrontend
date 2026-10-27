export type ThesisCorrectionStatus = 'to_correct' | 'corrected' | 'validated';
export type ThesisCorrectionPriority = 'low' | 'medium' | 'high';

export interface ThesisVersionRef {
  id: number;
  version_number: number;
}

export interface ThesisCorrection {
  id: number;
  thesis_id: number;
  thesis_version: ThesisVersionRef | number;
  remark: string;
  page_number: number | null;
  section: string | null;
  anchor: string | null;
  priority: ThesisCorrectionPriority;
  status: ThesisCorrectionStatus;
  created_at: string;
  updated_at: string;
  author?: { id: number; full_name: string };
}

export interface CreateThesisCorrectionPayload {
  thesis_version_id: number;
  remark: string;
  page_number?: number;
  section?: string;
  anchor?: string;
  priority?: ThesisCorrectionPriority;
}
