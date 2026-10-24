import { TestBed } from '@angular/core/testing';
import { TokenStorageService } from './token-storage.service';

describe('TokenStorageService', () => {
  const tokenKey = 'thesis_auth_token';
  const userKey = 'thesis_auth_user';

  afterEach(() => {
    localStorage.removeItem(tokenKey);
    localStorage.removeItem(userKey);
    TestBed.resetTestingModule();
  });

  it('clears a cached session when the stored user JSON is malformed', () => {
    localStorage.setItem(tokenKey, 'cached-token');
    localStorage.setItem(userKey, '{');
    spyOn(console, 'warn');

    const service = TestBed.inject(TokenStorageService);

    expect(service.getUser()).toBeNull();
    expect(service.getToken()).toBeNull();
    expect(service.isAuthenticated()).toBeFalse();
    expect(localStorage.getItem(tokenKey)).toBeNull();
    expect(localStorage.getItem(userKey)).toBeNull();
    expect(console.warn).toHaveBeenCalled();
  });
});
