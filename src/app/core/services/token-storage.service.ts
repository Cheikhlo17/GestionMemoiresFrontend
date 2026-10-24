import { Injectable, signal } from '@angular/core';
import { User } from '../models/user.model';

const TOKEN_KEY = 'thesis_auth_token';
const USER_KEY = 'thesis_auth_user';

@Injectable({ providedIn: 'root' })
export class TokenStorageService {
  private readonly _user = signal<User | null>(this.readUser());
  private readonly _token = signal<string | null>(this.readToken());

  readonly token = this._token.asReadonly();
  readonly user = this._user.asReadonly();

  private readToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  private readUser(): User | null {
    const raw = localStorage.getItem(USER_KEY);
    if (!raw) return null;

    let user: unknown;
    try {
      user = JSON.parse(raw);
    } catch (error) {
      if (!(error instanceof SyntaxError)) throw error;
      this.clearInvalidSession();
      return null;
    }

    if (!this.isStoredUser(user)) {
      this.clearInvalidSession();
      return null;
    }

    return user;
  }

  private isStoredUser(value: unknown): value is User {
    if (!value || typeof value !== 'object') return false;

    const user = value as Record<string, unknown>;
    const role = user['role'];
    if (!role || typeof role !== 'object') return false;

    const storedRole = role as Record<string, unknown>;
    return (
      typeof user['id'] === 'number' &&
      typeof user['first_name'] === 'string' &&
      typeof user['last_name'] === 'string' &&
      typeof user['full_name'] === 'string' &&
      typeof user['email'] === 'string' &&
      typeof storedRole['id'] === 'number' &&
      typeof storedRole['name'] === 'string' &&
      typeof storedRole['slug'] === 'string'
    );
  }

  private clearInvalidSession(): void {
    console.warn('Stored SUMA user data is invalid; clearing the cached session.');
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  }

  setSession(token: string, user: User): void {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    this._token.set(token);
    this._user.set(user);
  }

  setUser(user: User): void {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    this._user.set(user);
  }

  getToken(): string | null {
    return this._token();
  }

  getUser(): User | null {
    return this._user();
  }

  clear(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    this._token.set(null);
    this._user.set(null);
  }

  isAuthenticated(): boolean {
    return !!this._token();
  }
}