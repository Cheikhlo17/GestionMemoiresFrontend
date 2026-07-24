import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiSuccessResponse } from '../models/auth-response.model';
import { Student } from '../models/student.model';
import { PaginatedResponse, StudentFilters, StudentPayload } from '../interfaces/student.interface';

@Injectable({ providedIn: 'root' })
export class StudentService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/students`;

  list(filters: StudentFilters): Observable<PaginatedResponse<Student>> {
    let params = new HttpParams();

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        params = params.set(key, String(value));
      }
    });

    return this.http.get<PaginatedResponse<Student>>(this.baseUrl, { params });
  }

  get(id: number): Observable<ApiSuccessResponse<Student>> {
    return this.http.get<ApiSuccessResponse<Student>>(`${this.baseUrl}/${id}`);
  }

  create(payload: StudentPayload): Observable<ApiSuccessResponse<Student>> {
    return this.http.post<ApiSuccessResponse<Student>>(this.baseUrl, payload);
  }

  update(id: number, payload: Partial<StudentPayload>): Observable<ApiSuccessResponse<Student>> {
    return this.http.put<ApiSuccessResponse<Student>>(`${this.baseUrl}/${id}`, payload);
  }

  delete(id: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.baseUrl}/${id}`);
  }
}