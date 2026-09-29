import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../core/services/auth.service';
import { UiLabelPipe } from '../../shared/pipes/ui-label.pipe';

interface QuickAction {
  label: string;
  description: string;
  icon: string;
  route: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, MatCardModule, MatButtonModule, MatIconModule, UiLabelPipe],
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
          { label: 'Gérer les étudiants', description: 'Consulter, ajouter et modifier les dossiers étudiants.', icon: 'school', route: '/students' },
          { label: 'Consulter les mémoires', description: 'Parcourir tous les mémoires soumis.', icon: 'article', route: '/theses' },
          { label: 'Calendrier des soutenances', description: 'Planifier et gérer les soutenances.', icon: 'event', route: '/defenses' },
        ];
      case 'head-of-department':
        return [
          { label: 'Gérer les étudiants', description: 'Consulter les dossiers étudiants de votre département.', icon: 'school', route: '/students' },
          { label: 'Examiner les mémoires', description: 'Valider les mémoires en attente d’approbation.', icon: 'article', route: '/theses' },
          { label: 'Planifier les soutenances', description: 'Attribuer les salles et les membres du jury.', icon: 'event', route: '/defenses' },
        ];
      case 'supervisor':
        return [
          { label: 'Mémoires encadrés', description: 'Examiner les travaux de vos étudiants et les commenter.', icon: 'article', route: '/theses' },
          { label: 'Calendrier des soutenances', description: 'Consulter les prochaines soutenances de vos étudiants.', icon: 'event', route: '/defenses' },
        ];
      case 'jury-member':
        return [
          { label: 'Calendrier des soutenances', description: 'Consulter les soutenances auxquelles vous participez.', icon: 'event', route: '/defenses' },
        ];
      case 'student':
      default:
        return [
          { label: 'Mon mémoire', description: 'Soumettre votre mémoire, déposer des versions et suivre son statut.', icon: 'article', route: '/theses' },
          { label: 'Calendrier des soutenances', description: 'Consulter la date prévue de votre soutenance.', icon: 'event', route: '/defenses' },
        ];
    }
  }
}