import { JuryRole } from '../models/jury-member.model';
import { DefenseVerdict } from '../models/defense-schedule.model';

export interface CalendarFilters {
  from: string;
  to: string;
  room_id?: number | null;
  status?: string | null;
}

export interface ScheduleDefensePayload {
  thesis_id: number;
  defense_room_id: number;
  scheduled_at: string;
  duration_minutes?: number;
}

export interface RescheduleDefensePayload {
  defense_room_id?: number;
  scheduled_at?: string;
  duration_minutes?: number;
}

export interface JuryAssignment {
  jury_member_id: number;
  role: JuryRole;
}

export interface AssignJuryPayload {
  jury: JuryAssignment[];
}

export interface RecordResultPayload {
  final_grade?: number | null;
  verdict: DefenseVerdict;
  remarks?: string;
}