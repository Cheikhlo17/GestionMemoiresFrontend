export type SupervisionActionStatus = 'pending' | 'in_progress' | 'completed';

export interface SupervisionAssignedUser {
  id: number;
  full_name: string;
}

export interface SupervisionAction {
  id: number;
  meeting_id: number;
  assigned_to: number | SupervisionAssignedUser;
  description: string;
  due_at: string;
  status: SupervisionActionStatus;
}

export interface SupervisionMeeting {
  id: number;
  thesis_id: number;
  scheduled_at: string;
  mode: string;
  duration_minutes: number;
  location: string | null;
  agenda: string | null;
  minutes: string | null;
  difficulties: string | null;
  decisions: string | null;
  thesis?: { id: number; title: string };
  actions?: SupervisionAction[];
}

export interface SupervisionMeetingPayload {
  scheduled_at?: string;
  mode?: string;
  duration_minutes?: number;
  location?: string | null;
  agenda?: string | null;
  minutes?: string | null;
  difficulties?: string | null;
  decisions?: string | null;
}

export interface CreateSupervisionActionPayload {
  assigned_to: number;
  description: string;
  due_at: string;
}
