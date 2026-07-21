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
        <p>User, department, and program management modules will be built here in the next phase.</p>
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