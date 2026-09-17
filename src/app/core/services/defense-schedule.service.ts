import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiSuccessResponse } from '../models/auth-response.model';
import { DefenseResult, DefenseSchedule } from '../models/defense-schedule.model';
import {
  AssignJuryPayload,
  CalendarFilters,
  RecordResultPayload,
  RescheduleDefensePayload,
  ScheduleDefensePayload,
} from '../interfaces/defense.interface';

@Injectable({ providedIn: 'root' })
export class DefenseScheduleService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/defense-schedules`;

  calendar(filters: CalendarFilters): Observable<ApiSuccessResponse<DefenseSchedule[]>> {
    let params = new HttpParams().set('from', filters.from).set('to', filters.to);

    if (filters.room_id) params = params.set('room_id', filters.room_id);
    if (filters.status) params = params.set('status', filters.status);

    return this.http.get<ApiSuccessResponse<DefenseSchedule[]>>(`${this.baseUrl}/calendar`, {
      params,
    });
  }

  get(id: number): Observable<ApiSuccessResponse<DefenseSchedule>> {
    return this.http.get<ApiSuccessResponse<DefenseSchedule>>(`${this.baseUrl}/${id}`);
  }

  schedule(payload: ScheduleDefensePayload): Observable<ApiSuccessResponse<DefenseSchedule>> {
    return this.http.post<ApiSuccessResponse<DefenseSchedule>>(this.baseUrl, payload);
  }

  reschedule(
    id: number,
    payload: RescheduleDefensePayload
  ): Observable<ApiSuccessResponse<DefenseSchedule>> {
    return this.http.put<ApiSuccessResponse<DefenseSchedule>>(`${this.baseUrl}/${id}`, payload);
  }

  assignJury(id: number, payload: AssignJuryPayload): Observable<ApiSuccessResponse<DefenseSchedule>> {
    return this.http.post<ApiSuccessResponse<DefenseSchedule>>(
      `${this.baseUrl}/${id}/assign-jury`,
      payload
    );
  }

  cancel(id: number, reason: string): Observable<ApiSuccessResponse<DefenseSchedule>> {
    return this.http.post<ApiSuccessResponse<DefenseSchedule>>(`${this.baseUrl}/${id}/cancel`, {
      reason,
    });
  }

  recordResult(id: number, payload: RecordResultPayload): Observable<ApiSuccessResponse<DefenseResult>> {
    return this.http.post<ApiSuccessResponse<DefenseResult>>(`${this.baseUrl}/${id}/result`, payload);
  }

  downloadReport(id: number): Observable<Blob> {
    return this.http.get(`${this.baseUrl}/${id}/report`, { responseType: 'blob' });
  }
}