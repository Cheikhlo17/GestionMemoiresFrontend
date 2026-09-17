import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AcademicYear } from '../models/academic-year.model';
import { ApiSuccessResponse } from '../models/auth-response.model';
import { Department } from '../models/department.model';
import { DefenseRoom } from '../models/defense-room.model';
import { JuryMember } from '../models/jury-member.model';
import { Program } from '../models/program.model';

@Injectable({ providedIn: 'root' })
export class LookupService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/lookups`;

  departments(): Observable<ApiSuccessResponse<Department[]>> {
    return this.http.get<ApiSuccessResponse<Department[]>>(`${this.baseUrl}/departments`);
  }

  programs(departmentId?: number): Observable<ApiSuccessResponse<Program[]>> {
    let params = new HttpParams();
    if (departmentId) {
      params = params.set('department_id', departmentId);
    }
    return this.http.get<ApiSuccessResponse<Program[]>>(`${this.baseUrl}/programs`, { params });
  }

  academicYears(): Observable<ApiSuccessResponse<AcademicYear[]>> {
    return this.http.get<ApiSuccessResponse<AcademicYear[]>>(`${this.baseUrl}/academic-years`);
  }

  defenseRooms(): Observable<ApiSuccessResponse<DefenseRoom[]>> {
    return this.http.get<ApiSuccessResponse<DefenseRoom[]>>(`${this.baseUrl}/defense-rooms`);
  }

  juryMembers(departmentId?: number): Observable<ApiSuccessResponse<JuryMember[]>> {
    let params = new HttpParams();
    if (departmentId) {
      params = params.set('department_id', departmentId);
    }
    return this.http.get<ApiSuccessResponse<JuryMember[]>>(`${this.baseUrl}/jury-members`, {
      params,
    });
  }
}