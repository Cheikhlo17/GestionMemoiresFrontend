import { DefenseVerdict } from './defense-schedule.model';

export interface DefenseJuryEvaluation {
  id: number;
  grade: number | null;
  verdict: DefenseVerdict | null;
  remarks: string | null;
  submitted_at: string | null;
  jury_member: { id: number; full_name: string };
}

export interface JuryEvaluationPayload {
  grade?: number | null;
  verdict: DefenseVerdict;
  remarks?: string;
}