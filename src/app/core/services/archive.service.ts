import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { PaginatedResponse } from '../interfaces/student.interface';
import { ArchiveFilters } from '../interfaces/archive.interface';
import { ApiSuccessResponse } from '../models/auth-response.model';
import { ThesisArchivePublic } from '../models/thesis-archive.model';

@Injectable({ providedIn: 'root' })
export class ArchiveService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/archives`;

  list(filters: ArchiveFilters): Observable<PaginatedResponse<ThesisArchivePublic>> {
    let params = new HttpParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        params = params.set(key, String(value));
      }
    });
    return this.http.get<PaginatedResponse<ThesisArchivePublic>>(this.baseUrl, { params });
  }

  get(id: number): Observable<ApiSuccessResponse<ThesisArchivePublic>> {
    return this.http.get<ApiSuccessResponse<ThesisArchivePublic>>(`${this.baseUrl}/${id}`);
  }

  downloadUrl(id: number): string {
    return `${this.baseUrl}/${id}/download`;
  }

  downloadBlob(id: number): Observable<Blob> {
    return this.http.get(this.downloadUrl(id), { responseType: 'blob' });
  }
}