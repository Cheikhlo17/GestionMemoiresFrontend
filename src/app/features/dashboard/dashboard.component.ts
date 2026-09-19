import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../core/services/auth.service';

interface QuickAction {
  label: string;
  description: string;
  icon: string;
  route: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, MatCardModule, MatButtonModule, MatIconModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent {
  readonly authService = inject(AuthService);

  get quickActions(): QuickAction[] {
    const role = this.authService.currentRole();

    switch (role) {
      case 'administrator':
        return [
          { label: 'Manage Students', description: 'View, add, and edit student records.', icon: 'school', route: '/students' },
          { label: 'View Theses', description: 'Browse all submitted theses.', icon: 'article', route: '/theses' },
          { label: 'Defense Calendar', description: 'Schedule and manage defenses.', icon: 'event', route: '/defenses' },
        ];
      case 'head-of-department':
        return [
          { label: 'Manage Students', description: 'View student records in your department.', icon: 'school', route: '/students' },
          { label: 'Review Theses', description: 'Validate theses awaiting department approval.', icon: 'article', route: '/theses' },
          { label: 'Schedule Defenses', description: 'Assign rooms and jury panels.', icon: 'event', route: '/defenses' },
        ];
      case 'supervisor':
        return [
          { label: 'Supervised Theses', description: 'Review and comment on your students\' work.', icon: 'article', route: '/theses' },
          { label: 'Defense Calendar', description: 'See upcoming defenses for your students.', icon: 'event', route: '/defenses' },
        ];
      case 'jury-member':
        return [
          { label: 'Defense Calendar', description: 'View defenses you are assigned to judge.', icon: 'event', route: '/defenses' },
        ];
      case 'student':
      default:
        return [
          { label: 'My Thesis', description: 'Submit your thesis, upload versions, and track its status.', icon: 'article', route: '/theses' },
          { label: 'Defense Calendar', description: 'See your scheduled defense date, if any.', icon: 'event', route: '/defenses' },
        ];
    }
  }
}