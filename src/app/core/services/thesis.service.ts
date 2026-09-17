import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiSuccessResponse } from '../models/auth-response.model';
import { Comment, Thesis, ThesisVersion } from '../models/thesis.model';
import {
  AssignSupervisorPayload,
  ChangeStatusPayload,
  CommentPayload,
  ThesisFilters,
  ThesisPayload,
} from '../interfaces/thesis.interface';
import { PaginatedResponse } from '../interfaces/student.interface';

@Injectable({ providedIn: 'root' })
export class ThesisService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/theses`;

  list(filters: ThesisFilters): Observable<PaginatedResponse<Thesis>> {
    let params = new HttpParams();

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        params = params.set(key, String(value));
      }
    });

    return this.http.get<PaginatedResponse<Thesis>>(this.baseUrl, { params });
  }

  get(id: number): Observable<ApiSuccessResponse<Thesis>> {
    return this.http.get<ApiSuccessResponse<Thesis>>(`${this.baseUrl}/${id}`);
  }

  create(payload: ThesisPayload): Observable<ApiSuccessResponse<Thesis>> {
    return this.http.post<ApiSuccessResponse<Thesis>>(this.baseUrl, payload);
  }

  update(id: number, payload: Partial<ThesisPayload>): Observable<ApiSuccessResponse<Thesis>> {
    return this.http.put<ApiSuccessResponse<Thesis>>(`${this.baseUrl}/${id}`, payload);
  }

  delete(id: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.baseUrl}/${id}`);
  }

  submit(id: number): Observable<ApiSuccessResponse<Thesis>> {
    return this.http.post<ApiSuccessResponse<Thesis>>(`${this.baseUrl}/${id}/submit`, {});
  }

  assignSupervisor(
    id: number,
    payload: AssignSupervisorPayload
  ): Observable<ApiSuccessResponse<Thesis>> {
    return this.http.post<ApiSuccessResponse<Thesis>>(
      `${this.baseUrl}/${id}/assign-supervisor`,
      payload
    );
  }

  changeStatus(id: number, payload: ChangeStatusPayload): Observable<ApiSuccessResponse<Thesis>> {
    return this.http.post<ApiSuccessResponse<Thesis>>(`${this.baseUrl}/${id}/status`, payload);
  }

  listVersions(thesisId: number): Observable<ApiSuccessResponse<ThesisVersion[]>> {
    return this.http.get<ApiSuccessResponse<ThesisVersion[]>>(
      `${this.baseUrl}/${thesisId}/versions`
    );
  }

  uploadVersion(
    thesisId: number,
    file: File,
    notes?: string
  ): Observable<ApiSuccessResponse<ThesisVersion>> {
    const formData = new FormData();
    formData.append('file', file);
    if (notes) {
      formData.append('notes', notes);
    }

    return this.http.post<ApiSuccessResponse<ThesisVersion>>(
      `${this.baseUrl}/${thesisId}/versions`,
      formData
    );
  }

  downloadVersion(thesisId: number, versionId: number): Observable<Blob> {
    return this.http.get(`${this.baseUrl}/${thesisId}/versions/${versionId}/download`, {
      responseType: 'blob',
    });
  }

  listComments(thesisId: number): Observable<ApiSuccessResponse<Comment[]>> {
    return this.http.get<ApiSuccessResponse<Comment[]>>(`${this.baseUrl}/${thesisId}/comments`);
  }

  addComment(thesisId: number, payload: CommentPayload): Observable<ApiSuccessResponse<Comment>> {
    return this.http.post<ApiSuccessResponse<Comment>>(
      `${this.baseUrl}/${thesisId}/comments`,
      payload
    );
  }
}