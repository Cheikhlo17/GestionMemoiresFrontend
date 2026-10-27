export interface PublicDefenseCalendarEvent {
  id: number;
  scheduled_at: string;
  title: string;
  department?: string | null;
  program?: string | null;
  room?: string | null;
  room_building?: string | null;
}

export interface PublicDefenseCalendarFilters {
  from: string;
  to: string;
  department_id?: number | null;
  room_id?: number | null;
}
