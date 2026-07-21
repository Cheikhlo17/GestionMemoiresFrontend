import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  ApiSuccessResponse,
  AuthResponse,
} from '../models/auth-response.model';
import { User } from '../models/user.model';
import {
  ChangePasswordPayload,
  ForgotPasswordPayload,
  LoginPayload,
  RegisterPayload,
  ResetPasswordPayload,
} from '../interfaces/auth.interface';
import { TokenStorageService } from './token-storage.service';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly tokenStorage = inject(TokenStorageService);

  private readonly baseUrl = `${environment.apiUrl}/auth`;

  readonly currentUser = this.tokenStorage.user;
  readonly isAuthenticated = computed(() => this.tokenStorage.isAuthenticated());
  readonly currentRole = computed(() => this.tokenStorage.user()?.role?.slug ?? null);

  login(payload: LoginPayload): Observable<ApiSuccessResponse<AuthResponse>> {
    return this.http
      .post<ApiSuccessResponse<AuthResponse>>(`${this.baseUrl}/login`, payload)
      .pipe(
        tap((res) =>
          this.tokenStorage.setSession(res.data.token, res.data.user)
        )
      );
  }

  register(
    payload: RegisterPayload
  ): Observable<ApiSuccessResponse<AuthResponse>> {
    return this.http
      .post<ApiSuccessResponse<AuthResponse>>(
        `${this.baseUrl}/register`,
        payload
      )
      .pipe(
        tap((res) =>
          this.tokenStorage.setSession(res.data.token, res.data.user)
        )
      );
  }

  logout(): void {
    this.http.post(`${this.baseUrl}/logout`, {}).subscribe({
      complete: () => this.finishLogout(),
      error: () => this.finishLogout(),
    });
  }

  private finishLogout(): void {
    this.tokenStorage.clear();
    this.router.navigate(['/auth/login']);
  }

  fetchMe(): Observable<ApiSuccessResponse<User>> {
    return this.http
      .get<ApiSuccessResponse<User>>(`${this.baseUrl}/me`)
      .pipe(tap((res) => this.tokenStorage.setUser(res.data)));
  }

  forgotPassword(payload: ForgotPasswordPayload): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(
      `${this.baseUrl}/forgot-password`,
      payload
    );
  }

  resetPassword(payload: ResetPasswordPayload): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(
      `${this.baseUrl}/reset-password`,
      payload
    );
  }

  changePassword(payload: ChangePasswordPayload): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(
      `${this.baseUrl}/change-password`,
      payload
    );
  }

  hasRole(...roles: string[]): boolean {
    const role = this.currentRole();
    return !!role && roles.includes(role);
  }
}