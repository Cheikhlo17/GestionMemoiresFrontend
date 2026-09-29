import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AcademicYear } from '../models/academic-year.model';
import { ApiSuccessResponse } from '../models/auth-response.model';
import { DepartmentDetail } from '../models/department-detail.model';
import { Program } from '../models/program.model';
import { PaginatedResponse } from '../interfaces/student.interface';
import { UserListItem } from '../models/user-list.model';

export interface DepartmentPayload {
  name: string;
  code: string;
  head_of_department_id?: number | null;
  is_active?: boolean;
}

export interface ProgramPayload {
  department_id: number;
  name: string;
  code: string;
  degree_level: 'bachelor' | 'master' | 'phd';
  is_active?: boolean;
}

export interface AcademicYearPayload {
  label: string;
  start_date: string;
  end_date: string;
  is_current?: boolean;
}

@Injectable({ providedIn: 'root' })
export class AdminService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/admin`;

  listDepartments(search?: string): Observable<PaginatedResponse<DepartmentDetail>> {
    let params = new HttpParams().set('per_page', 50);
    if (search) params = params.set('search', search);
    return this.http.get<PaginatedResponse<DepartmentDetail>>(`${this.baseUrl}/departments`, {
      params,
    });
  }

  createDepartment(payload: DepartmentPayload): Observable<ApiSuccessResponse<DepartmentDetail>> {
    return this.http.post<ApiSuccessResponse<DepartmentDetail>>(
      `${this.baseUrl}/departments`,
      payload
    );
  }

  updateDepartment(
    id: number,
    payload: Partial<DepartmentPayload>
  ): Observable<ApiSuccessResponse<DepartmentDetail>> {
    return this.http.put<ApiSuccessResponse<DepartmentDetail>>(
      `${this.baseUrl}/departments/${id}`,
      payload
    );
  }

  deleteDepartment(id: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.baseUrl}/departments/${id}`);
  }

  listPrograms(departmentId?: number): Observable<PaginatedResponse<Program>> {
    let params = new HttpParams().set('per_page', 100);
    if (departmentId) params = params.set('department_id', departmentId);
    return this.http.get<PaginatedResponse<Program>>(`${this.baseUrl}/programs`, { params });
  }

  createProgram(payload: ProgramPayload): Observable<ApiSuccessResponse<Program>> {
    return this.http.post<ApiSuccessResponse<Program>>(`${this.baseUrl}/programs`, payload);
  }

  updateProgram(
    id: number,
    payload: Partial<ProgramPayload>
  ): Observable<ApiSuccessResponse<Program>> {
    return this.http.put<ApiSuccessResponse<Program>>(`${this.baseUrl}/programs/${id}`, payload);
  }

  deleteProgram(id: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.baseUrl}/programs/${id}`);
  }

  listAcademicYears(): Observable<ApiSuccessResponse<AcademicYear[]>> {
    return this.http.get<ApiSuccessResponse<AcademicYear[]>>(`${this.baseUrl}/academic-years`);
  }

  createAcademicYear(payload: AcademicYearPayload): Observable<ApiSuccessResponse<AcademicYear>> {
    return this.http.post<ApiSuccessResponse<AcademicYear>>(
      `${this.baseUrl}/academic-years`,
      payload
    );
  }

  updateAcademicYear(
    id: number,
    payload: Partial<AcademicYearPayload>
  ): Observable<ApiSuccessResponse<AcademicYear>> {
    return this.http.put<ApiSuccessResponse<AcademicYear>>(
      `${this.baseUrl}/academic-years/${id}`,
      payload
    );
  }

  deleteAcademicYear(id: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.baseUrl}/academic-years/${id}`);
  }

  listUsers(filters: {
    search?: string;
    role_id?: number | null;
    is_active?: boolean | null;
    per_page?: number;
    page?: number;
  }): Observable<PaginatedResponse<UserListItem>> {
    let params = new HttpParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        params = params.set(key, String(value));
      }
    });
    return this.http.get<PaginatedResponse<UserListItem>>(`${this.baseUrl}/users`, { params });
  }

  toggleUserActive(id: number): Observable<ApiSuccessResponse<UserListItem>> {
    return this.http.post<ApiSuccessResponse<UserListItem>>(
      `${this.baseUrl}/users/${id}/toggle-active`,
      {}
    );
  }
}