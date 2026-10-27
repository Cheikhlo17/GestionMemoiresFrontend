import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { environment } from '../../../environments/environment';
import { AdminImportService } from './admin-import.service';
import { PreDefenseService } from './pre-defense.service';
import { PublicDefenseCalendarService } from './public-defense-calendar.service';
import { SupervisionMeetingService } from './supervision-meeting.service';
import { ThesisCorrectionService } from './thesis-correction.service';
import { ThesisSubjectService } from './thesis-subject.service';

describe('Laravel contract services', () => {
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('requests paginated thesis subjects with the documented filters', () => {
    const service = TestBed.inject(ThesisSubjectService);
    service.list({ page: 2, per_page: 15, status: 'published' }).subscribe();

    const request = http.expectOne(
      `${environment.apiUrl}/thesis-subjects?page=2&per_page=15&status=published`
    );
    expect(request.request.method).toBe('GET');
    request.flush({ data: [], meta: { current_page: 2, last_page: 2, per_page: 15, total: 16 } });
  });

  it('uses the thesis-scoped corrections endpoint and posts only the requested transition', () => {
    const service = TestBed.inject(ThesisCorrectionService);
    service.updateStatus(12, 5, 'validated').subscribe();

    const request = http.expectOne(
      `${environment.apiUrl}/theses/12/corrections/5/status`
    );
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual({ status: 'validated' });
    request.flush({ message: 'Updated', data: { id: 5 } });
  });

  it('sends required public calendar date filters to the public endpoint', () => {
    const service = TestBed.inject(PublicDefenseCalendarService);
    service
      .list({
        from: '2026-01-01T00:00:00.000Z',
        to: '2026-01-31T23:59:59.999Z',
        department_id: 3,
        room_id: 8,
      })
      .subscribe();

    const request = http.expectOne(
      `${environment.apiUrl}/defense-calendar?from=2026-01-01T00:00:00.000Z&to=2026-01-31T23:59:59.999Z&department_id=3&room_id=8`
    );
    expect(request.request.method).toBe('GET');
    request.flush({ message: 'OK', data: [] });
  });

  it('previews and confirms CSV imports using the same file and server hash', () => {
    const service = TestBed.inject(AdminImportService);
    const file = new File(['csv'], 'students.csv', { type: 'text/csv' });
    service.preview('students', file).subscribe();

    const preview = http.expectOne(`${environment.apiUrl}/admin/imports/students/preview`);
    expect(preview.request.method).toBe('POST');
    expect(preview.request.body.get('file')).toBe(file);
    preview.flush({ message: 'Preview', data: { preview_hash: 'abc123', rows: [] } });

    service.confirm('students', file, 'abc123').subscribe();
    const confirm = http.expectOne(`${environment.apiUrl}/admin/imports/students/confirm`);
    expect(confirm.request.method).toBe('POST');
    expect(confirm.request.body.get('file')).toBe(file);
    expect(confirm.request.body.get('preview_hash')).toBe('abc123');
    confirm.flush({ message: 'Imported', data: {} });
  });

  it('uses the pre-defense session nested passage endpoint and sends the contracted outcome field', () => {
    const service = TestBed.inject(PreDefenseService);
    service.updatePassage(4, 11, { outcome: 'ready' }).subscribe();

    const request = http.expectOne(
      `${environment.apiUrl}/pre-defense-sessions/4/passages/11`
    );
    expect(request.request.method).toBe('PUT');
    expect(request.request.body).toEqual({ outcome: 'ready' });
    request.flush({ message: 'Updated', data: { id: 11 } });
  });

  it('posts supervision actions under their meeting and updates status by PUT', () => {
    const service = TestBed.inject(SupervisionMeetingService);
    service.updateAction(7, 13, 'completed').subscribe();

    const request = http.expectOne(
      `${environment.apiUrl}/supervision-meetings/7/actions/13`
    );
    expect(request.request.method).toBe('PUT');
    expect(request.request.body).toEqual({ status: 'completed' });
    request.flush({ message: 'Updated', data: { id: 13 } });
  });
});
