import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiSuccessResponse } from '../models/auth-response.model';
import {
  CreateThesisCorrectionPayload,
  ThesisCorrection,
  ThesisCorrectionStatus,
} from '../models/thesis-correction.model';

@Injectable({ providedIn: 'root' })
export class ThesisCorrectionService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/theses`;

  list(thesisId: number): Observable<ApiSuccessResponse<ThesisCorrection[]>> {
    return this.http.get<ApiSuccessResponse<ThesisCorrection[]>>(
      `${this.baseUrl}/${thesisId}/corrections`
    );
  }

  create(
    thesisId: number,
    payload: CreateThesisCorrectionPayload
  ): Observable<ApiSuccessResponse<ThesisCorrection>> {
    return this.http.post<ApiSuccessResponse<ThesisCorrection>>(
      `${this.baseUrl}/${thesisId}/corrections`,
      payload
    );
  }

  updateStatus(
    thesisId: number,
    correctionId: number,
    status: ThesisCorrectionStatus
  ): Observable<ApiSuccessResponse<ThesisCorrection>> {
    return this.http.post<ApiSuccessResponse<ThesisCorrection>>(
      `${this.baseUrl}/${thesisId}/corrections/${correctionId}/status`,
      { status }
    );
  }
}
