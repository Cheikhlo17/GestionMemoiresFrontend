import { Department } from './department.model';

export type JuryRole = 'president' | 'examiner' | 'reporter';

export interface JuryMember {
  id: number;
  full_name: string;
  specialization: string | null;
  department?: Department;
  role?: JuryRole;
}