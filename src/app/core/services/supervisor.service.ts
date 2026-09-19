import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiSuccessResponse } from '../models/auth-response.model';
import { Supervisor } from '../models/supervisor.model';

@Injectable({ providedIn: 'root' })
export class SupervisorService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/supervisors`;

  me(): Observable<ApiSuccessResponse<Supervisor>> {
    return this.http.get<ApiSuccessResponse<Supervisor>>(`${this.baseUrl}/me`);
  }
}