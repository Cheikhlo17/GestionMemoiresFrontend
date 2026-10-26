export interface PublicDefenseCalendarEvent {
  id: number;
  scheduled_at: string;
  title: string;
  department?: { name: string } | null;
  program?: { name: string } | null;
  room?: { name: string; building?: string | null } | null;
}

export interface PublicDefenseCalendarFilters {
  from: string;
  to: string;
  department_id?: number | null;
  room_id?: number | null;
}
