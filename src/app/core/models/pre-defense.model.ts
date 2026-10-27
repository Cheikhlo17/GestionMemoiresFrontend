export type PreDefensePassageOutcome = 'pending' | 'ready' | 'needs_revision';

export interface PreDefensePassage {
  id: number;
  thesis_id: number;
  position: number;
  scheduled_at: string;
  duration_minutes: number;
  outcome: PreDefensePassageOutcome;
  observations: string | null;
  recommendations: string | null;
  thesis?: { title: string };
}

export interface PreDefenseSession {
  id: number;
  department_id: number;
  responsible_user_id: number;
  location: string;
  scheduled_at: string;
  duration_minutes: number;
  status: string;
  department?: { name: string };
  responsible?: { id?: number; full_name: string };
  passages?: PreDefensePassage[];
}

export interface PreDefenseSessionPayload {
  department_id?: number;
  responsible_user_id?: number;
  location?: string;
  scheduled_at?: string;
  duration_minutes?: number;
}

export interface PreDefensePassagePayload {
  thesis_id: number;
  position: number;
  scheduled_at: string;
  duration_minutes?: number;
  observations?: string;
  recommendations?: string;
}
