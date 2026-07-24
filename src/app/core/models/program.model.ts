import { Department } from './department.model';

export interface Program {
  id: number;
  name: string;
  code: string;
  degree_level: 'bachelor' | 'master' | 'phd';
  department?: Department;
}