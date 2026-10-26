import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiSuccessResponse } from '../models/auth-response.model';
import {
  CreateSupervisionActionPayload,
  SupervisionAction,
  SupervisionActionStatus,
  SupervisionMeeting,
  SupervisionMeetingPayload,
} from '../models/supervision-meeting.model';

@Injectable({ providedIn: 'root' })
export class SupervisionMeetingService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/supervision-meetings`;
  private readonly thesesUrl = `${environment.apiUrl}/theses`;

  list(): Observable<ApiSuccessResponse<SupervisionMeeting[]>> {
    return this.http.get<ApiSuccessResponse<SupervisionMeeting[]>>(this.baseUrl);
  }

  get(id: number): Observable<ApiSuccessResponse<SupervisionMeeting>> {
    return this.http.get<ApiSuccessResponse<SupervisionMeeting>>(`${this.baseUrl}/${id}`);
  }

  create(
    thesisId: number,
    payload: Required<Pick<SupervisionMeetingPayload, 'scheduled_at' | 'mode'>>
      & Pick<SupervisionMeetingPayload, 'duration_minutes' | 'location' | 'agenda' | 'minutes' | 'difficulties' | 'decisions'>
  ): Observable<ApiSuccessResponse<SupervisionMeeting>> {
    return this.http.post<ApiSuccessResponse<SupervisionMeeting>>(
      `${this.thesesUrl}/${thesisId}/supervision-meetings`,
      payload
    );
  }

  update(
    id: number,
    payload: SupervisionMeetingPayload
  ): Observable<ApiSuccessResponse<SupervisionMeeting>> {
    return this.http.put<ApiSuccessResponse<SupervisionMeeting>>(
      `${this.baseUrl}/${id}`,
      payload
    );
  }

  addAction(
    meetingId: number,
    payload: CreateSupervisionActionPayload
  ): Observable<ApiSuccessResponse<SupervisionAction>> {
    return this.http.post<ApiSuccessResponse<SupervisionAction>>(
      `${this.baseUrl}/${meetingId}/actions`,
      payload
    );
  }

  updateAction(
    meetingId: number,
    actionId: number,
    status: SupervisionActionStatus
  ): Observable<ApiSuccessResponse<SupervisionAction>> {
    return this.http.put<ApiSuccessResponse<SupervisionAction>>(
      `${this.baseUrl}/${meetingId}/actions/${actionId}`,
      { status }
    );
  }
}
