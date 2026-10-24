import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { environment } from '../../../environments/environment';
import { AuthService } from './auth.service';
import { TokenStorageService } from './token-storage.service';

describe('AuthService profile update', () => {
  let authService: AuthService;
  let httpTestingController: HttpTestingController;
  let tokenStorage: TokenStorageService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
      ],
    });
    authService = TestBed.inject(AuthService);
    httpTestingController = TestBed.inject(HttpTestingController);
    tokenStorage = TestBed.inject(TokenStorageService);
  });

  afterEach(() => {
    httpTestingController.verify();
    tokenStorage.clear();
  });

  it('posts profile fields as multipart form data and refreshes the cached user', () => {
    const updatedUser = {
      id: 7,
      first_name: 'Awa',
      last_name: 'Fall',
      full_name: 'Awa Fall',
      email: 'awa@example.test',
      phone: null,
      avatar: null,
      email_verified_at: null,
      is_active: true,
      last_login_at: null,
      role: { id: 1, name: 'Étudiant', slug: 'student', description: null },
      created_at: '',
      updated_at: '',
    };
    const avatar = new File(['image'], 'avatar.png', { type: 'image/png' });

    authService
      .updateProfile({
        first_name: 'Awa',
        last_name: 'Fall',
        email: 'awa@example.test',
        phone: '',
        avatar,
      })
      .subscribe();

    const request = httpTestingController.expectOne(`${environment.apiUrl}/auth/profile`);
    expect(request.request.method).toBe('POST');
    expect(request.request.body instanceof FormData).toBeTrue();
    expect(request.request.body.get('first_name')).toBe('Awa');
    expect(request.request.body.get('avatar')).toBe(avatar);
    request.flush({ message: 'Profile updated', data: updatedUser });

    expect(tokenStorage.getUser()).toEqual(updatedUser);
  });
});
