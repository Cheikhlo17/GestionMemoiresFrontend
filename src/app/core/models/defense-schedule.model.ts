import { DefenseRoom } from './defense-room.model';
import { JuryMember } from './jury-member.model';

export type DefenseStatus = 'scheduled' | 'completed' | 'cancelled' | 'postponed';
export type DefenseVerdict = 'pass' | 'pass_with_revisions' | 'fail';

export interface DefenseResult {
  id: number;
  final_grade: number | null;
  verdict: DefenseVerdict | null;
  remarks: string | null;
  recorded_at: string | null;
}

export interface DefenseThesisSummary {
  id: number;
  title: string;
  student_name: string;
  supervisor_name: string | null;
}

export interface DefenseSchedule {
  id: number;
  scheduled_at: string;
  ends_at: string;
  duration_minutes: number;
  status: DefenseStatus;
  thesis: DefenseThesisSummary;
  room: DefenseRoom;
  jury_members: JuryMember[];
  result: DefenseResult | null;
  created_at: string;
}