import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { PaginatedResponse } from '../interfaces/student.interface';
import {
  ArchiveFilters,
  ArchiveThesisPayload,
  EligibilityResult,
  UpdateArchivePayload,
} from '../interfaces/archive.interface';
import { ApiSuccessResponse } from '../models/auth-response.model';
import { ThesisArchiveAdmin } from '../models/thesis-archive.model';

@Injectable({ providedIn: 'root' })
export class AdminArchiveService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/admin`;

  list(filters: ArchiveFilters): Observable<PaginatedResponse<ThesisArchiveAdmin>> {
    let params = new HttpParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        params = params.set(key, String(value));
      }
    });
    return this.http.get<PaginatedResponse<ThesisArchiveAdmin>>(`${this.baseUrl}/archives`, {
      params,
    });
  }

  checkEligibility(thesisId: number): Observable<EligibilityResult> {
    return this.http.get<EligibilityResult>(
      `${this.baseUrl}/theses/${thesisId}/archive-eligibility`
    );
  }

  archive(
    thesisId: number,
    payload: ArchiveThesisPayload
  ): Observable<ApiSuccessResponse<ThesisArchiveAdmin>> {
    return this.http.post<ApiSuccessResponse<ThesisArchiveAdmin>>(
      `${this.baseUrl}/theses/${thesisId}/archive`,
      payload
    );
  }

  update(
    archiveId: number,
    payload: UpdateArchivePayload
  ): Observable<ApiSuccessResponse<ThesisArchiveAdmin>> {
    return this.http.put<ApiSuccessResponse<ThesisArchiveAdmin>>(
      `${this.baseUrl}/archives/${archiveId}`,
      payload
    );
  }

  delete(archiveId: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.baseUrl}/archives/${archiveId}`);
  }

  downloadUrl(archiveId: number): string {
    return `${this.baseUrl}/archives/${archiveId}/download`;
  }

  downloadBlob(archiveId: number): Observable<Blob> {
  return this.http.get(`${this.baseUrl}/archives/${archiveId}/download`, {
    responseType: 'blob',
  });
}
}