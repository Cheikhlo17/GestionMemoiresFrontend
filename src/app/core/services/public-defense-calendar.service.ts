import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiSuccessResponse } from '../models/auth-response.model';
import {
  PublicDefenseCalendarEvent,
  PublicDefenseCalendarFilters,
} from '../models/public-defense-calendar.model';

@Injectable({ providedIn: 'root' })
export class PublicDefenseCalendarService {
  private readonly http = inject(HttpClient);
  private readonly endpoint = `${environment.apiUrl}/defense-calendar`;

  list(
    filters: PublicDefenseCalendarFilters
  ): Observable<ApiSuccessResponse<PublicDefenseCalendarEvent[]>> {
    let params = new HttpParams().set('from', filters.from).set('to', filters.to);
    if (filters.department_id) params = params.set('department_id', filters.department_id);
    if (filters.room_id) params = params.set('room_id', filters.room_id);
    return this.http.get<ApiSuccessResponse<PublicDefenseCalendarEvent[]>>(this.endpoint, {
      params,
    });
  }
}
