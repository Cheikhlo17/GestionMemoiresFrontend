import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiSuccessResponse } from '../models/auth-response.model';
import {
  PreDefensePassage,
  PreDefensePassagePayload,
  PreDefensePassageResult,
  PreDefenseSession,
  PreDefenseSessionPayload,
} from '../models/pre-defense.model';

@Injectable({ providedIn: 'root' })
export class PreDefenseService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/pre-defense-sessions`;

  list(): Observable<ApiSuccessResponse<PreDefenseSession[]>> {
    return this.http.get<ApiSuccessResponse<PreDefenseSession[]>>(this.baseUrl);
  }

  get(id: number): Observable<ApiSuccessResponse<PreDefenseSession>> {
    return this.http.get<ApiSuccessResponse<PreDefenseSession>>(`${this.baseUrl}/${id}`);
  }

  create(
    payload: Required<Pick<PreDefenseSessionPayload, 'department_id' | 'responsible_user_id' | 'location' | 'scheduled_at'>>
      & Pick<PreDefenseSessionPayload, 'duration_minutes'>
  ): Observable<ApiSuccessResponse<PreDefenseSession>> {
    return this.http.post<ApiSuccessResponse<PreDefenseSession>>(this.baseUrl, payload);
  }

  update(id: number, payload: PreDefenseSessionPayload): Observable<ApiSuccessResponse<PreDefenseSession>> {
    return this.http.put<ApiSuccessResponse<PreDefenseSession>>(`${this.baseUrl}/${id}`, payload);
  }

  updateStatus(
    id: number,
    status: 'completed' | 'cancelled'
  ): Observable<ApiSuccessResponse<PreDefenseSession>> {
    return this.http.post<ApiSuccessResponse<PreDefenseSession>>(
      `${this.baseUrl}/${id}/status`,
      { status }
    );
  }

  addPassage(
    sessionId: number,
    payload: PreDefensePassagePayload
  ): Observable<ApiSuccessResponse<PreDefensePassage>> {
    return this.http.post<ApiSuccessResponse<PreDefensePassage>>(
      `${this.baseUrl}/${sessionId}/passages`,
      payload
    );
  }

  updatePassage(
    sessionId: number,
    passageId: number,
    payload: {
      result: PreDefensePassageResult;
      observations?: string;
      recommendations?: string;
    }
  ): Observable<ApiSuccessResponse<PreDefensePassage>> {
    return this.http.put<ApiSuccessResponse<PreDefensePassage>>(
      `${this.baseUrl}/${sessionId}/passages/${passageId}`,
      payload
    );
  }
}
