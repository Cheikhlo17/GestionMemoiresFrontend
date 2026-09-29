import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { AuthService } from '../../core/services/auth.service';
import { UiLabelPipe } from '../../shared/pipes/ui-label.pipe';

interface NavItem {
  label: string;
  icon: string;
  route: string;
  roles: string[];
}

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    MatSidenavModule,
    MatToolbarModule,
    MatListModule,
    MatIconModule,
    MatButtonModule,
    UiLabelPipe,
  ],
  templateUrl: './main-layout.component.html',
  styleUrl: './main-layout.component.scss',
})
export class MainLayoutComponent {
  readonly authService = inject(AuthService);

  readonly isSidenavOpen = signal(true);

  private readonly allNavItems: NavItem[] = [
    { label: 'Tableau de bord', icon: 'dashboard', route: '/dashboard', roles: [] },
    { label: 'Étudiants', icon: 'school', route: '/students', roles: ['administrator', 'head-of-department'] },
    { label: 'Mes étudiants', icon: 'groups', route: '/supervisor', roles: ['supervisor'] },
    { label: 'Mes soutenances', icon: 'gavel', route: '/jury', roles: ['jury-member'] },
    { label: 'Mémoires', icon: 'article', route: '/theses', roles: [] },
    { label: 'Soutenances', icon: 'event', route: '/defenses', roles: [] },
    { label: 'Administration', icon: 'admin_panel_settings', route: '/admin', roles: ['administrator'] },
  ];

  get navItems(): NavItem[] {
    const role = this.authService.currentRole();
    return this.allNavItems.filter(
      (item) => item.roles.length === 0 || (role && item.roles.includes(role))
    );
  }

  toggleSidenav(): void {
    this.isSidenavOpen.update((v) => !v);
  }

  logout(): void {
    this.authService.logout();
  }
}