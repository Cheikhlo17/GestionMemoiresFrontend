import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiSuccessResponse } from '../models/auth-response.model';
import {
  AdminImportPreview,
  AdminImportResult,
  AdminImportType,
} from '../models/admin-import.model';

@Injectable({ providedIn: 'root' })
export class AdminImportService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/admin/imports`;

  downloadTemplate(type: AdminImportType): Observable<Blob> {
    return this.http.get(`${this.baseUrl}/${type}/template`, { responseType: 'blob' });
  }

  preview(type: AdminImportType, file: File): Observable<ApiSuccessResponse<AdminImportPreview>> {
    const body = new FormData();
    body.append('file', file);
    return this.http.post<ApiSuccessResponse<AdminImportPreview>>(
      `${this.baseUrl}/${type}/preview`,
      body
    );
  }

  confirm(
    type: AdminImportType,
    file: File,
    previewHash: string
  ): Observable<ApiSuccessResponse<AdminImportResult>> {
    const body = new FormData();
    body.append('file', file);
    body.append('preview_hash', previewHash);
    return this.http.post<ApiSuccessResponse<AdminImportResult>>(
      `${this.baseUrl}/${type}/confirm`,
      body
    );
  }
}
