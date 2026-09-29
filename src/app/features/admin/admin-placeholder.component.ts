import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-admin-placeholder',
  standalone: true,
  imports: [CommonModule, MatCardModule],
  template: `
    <div class="admin-page">
      <mat-card>
        <h2>Administration</h2>
        <p>La gestion des utilisateurs, des départements et des formations sera disponible dans une prochaine version.</p>
      </mat-card>
    </div>
  `,
  styles: [
    `
      .admin-page {
        padding: 24px;
      }
    `,
  ],
})
export class AdminPlaceholderComponent {}