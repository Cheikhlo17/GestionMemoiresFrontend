export type AdminImportType = 'students' | 'jury-members';

export interface AdminImportPreviewRow {
  line: number;
  valid: boolean;
  duplicate: boolean;
  errors: string[] | Record<string, string[]>;
  data: Record<string, string | number | null>;
}

export interface AdminImportPreview {
  preview_hash: string;
  rows: AdminImportPreviewRow[];
}

export interface AdminImportResult {
  message?: string;
  imported?: number;
}
