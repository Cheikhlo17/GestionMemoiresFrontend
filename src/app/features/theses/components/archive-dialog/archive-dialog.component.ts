import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatChipsModule } from '@angular/material/chips';
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { AdminArchiveService } from '../../../../core/services/admin-archive.service';

export interface ArchiveDialogData {
  thesisId: number;
}

@Component({
  selector: 'app-archive-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatSelectModule,
    MatCheckboxModule,
    MatChipsModule,
    MatIconModule,
    MatButtonModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './archive-dialog.component.html',
})
export class ArchiveDialogComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly adminArchiveService = inject(AdminArchiveService);
  private readonly dialogRef = inject(MatDialogRef<ArchiveDialogComponent>);
  readonly data = inject<ArchiveDialogData>(MAT_DIALOG_DATA);

  readonly isChecking = signal(true);
  readonly isEligible = signal(false);
  readonly reasons = signal<string[]>([]);
  readonly isSubmitting = signal(false);

  readonly keywords: string[] = [];
  newKeyword = '';

  readonly form = this.fb.nonNullable.group({
    visibility: ['private' as 'public' | 'private'],
    show_final_grade: [false],
  });

  ngOnInit(): void {
    this.adminArchiveService.checkEligibility(this.data.thesisId).subscribe({
      next: (res) => {
        this.isEligible.set(res.eligible);
        this.reasons.set(res.reasons);
        this.isChecking.set(false);
      },
      error: () => this.isChecking.set(false),
    });
  }

  addKeyword(): void {
    const value = this.newKeyword.trim();
    if (value && !this.keywords.includes(value) && this.keywords.length < 15) {
      this.keywords.push(value);
    }
    this.newKeyword = '';
  }

  removeKeyword(keyword: string): void {
    const index = this.keywords.indexOf(keyword);
    if (index >= 0) this.keywords.splice(index, 1);
  }

  submit(): void {
    this.isSubmitting.set(true);
    this.adminArchiveService
      .archive(this.data.thesisId, { ...this.form.getRawValue(), keywords: this.keywords })
      .subscribe({
        next: (res) => {
          this.isSubmitting.set(false);
          this.dialogRef.close(res.data);
        },
        error: () => this.isSubmitting.set(false),
      });
  }

  cancel(): void {
    this.dialogRef.close(null);
  }
}