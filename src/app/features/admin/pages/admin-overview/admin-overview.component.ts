import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { MatTabsModule } from '@angular/material/tabs';

@Component({
  selector: 'app-admin-overview',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, RouterOutlet, MatTabsModule],
  templateUrl: './admin-overview.component.html',
  styleUrl: './admin-overview.component.scss',
})
export class AdminOverviewComponent {
  readonly tabs = [
    { label: 'Départements', route: 'departments' },
    { label: 'Formations', route: 'programs' },
    { label: 'Années académiques', route: 'academic-years' },
    { label: 'Utilisateurs', route: 'users' },
  ];
}