import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiSuccessResponse } from '../models/auth-response.model';
import { PaginatedResponse } from '../interfaces/student.interface';
import {
  ThesisSubject,
  ThesisSubjectFilters,
  ThesisSubjectPayload,
  ThesisSubjectStatus,
} from '../models/thesis-subject.model';

@Injectable({ providedIn: 'root' })
export class ThesisSubjectService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/thesis-subjects`;

  list(filters: ThesisSubjectFilters): Observable<PaginatedResponse<ThesisSubject>> {
    let params = new HttpParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params = params.set(key, String(value));
      }
    });
    return this.http.get<PaginatedResponse<ThesisSubject>>(this.baseUrl, { params });
  }

  get(id: number): Observable<ApiSuccessResponse<ThesisSubject>> {
    return this.http.get<ApiSuccessResponse<ThesisSubject>>(`${this.baseUrl}/${id}`);
  }

  create(payload: ThesisSubjectPayload): Observable<ApiSuccessResponse<ThesisSubject>> {
    return this.http.post<ApiSuccessResponse<ThesisSubject>>(this.baseUrl, payload);
  }

  update(
    id: number,
    payload: ThesisSubjectPayload
  ): Observable<ApiSuccessResponse<ThesisSubject>> {
    return this.http.put<ApiSuccessResponse<ThesisSubject>>(`${this.baseUrl}/${id}`, payload);
  }

  publish(
    departmentId: number,
    payload: ThesisSubjectPayload
  ): Observable<ApiSuccessResponse<ThesisSubject>> {
    return this.http.post<ApiSuccessResponse<ThesisSubject>>(`${this.baseUrl}/published`, {
      ...payload,
      department_id: departmentId,
    });
  }

  submit(id: number): Observable<ApiSuccessResponse<ThesisSubject>> {
    return this.http.post<ApiSuccessResponse<ThesisSubject>>(`${this.baseUrl}/${id}/submit`, {});
  }

  select(id: number): Observable<ApiSuccessResponse<ThesisSubject>> {
    return this.http.post<ApiSuccessResponse<ThesisSubject>>(`${this.baseUrl}/${id}/select`, {});
  }

  review(
    id: number,
    status: Extract<ThesisSubjectStatus, 'under_review' | 'accepted' | 'rejected'>,
    remarks?: string
  ): Observable<ApiSuccessResponse<ThesisSubject>> {
    return this.http.post<ApiSuccessResponse<ThesisSubject>>(
      `${this.baseUrl}/${id}/review`,
      { status, remarks }
    );
  }
}
