import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
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
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';

export interface VisibilityDialogData {
  visibility: 'public' | 'private';
  showFinalGrade: boolean;
  keywords: string[];
}

@Component({
  selector: 'app-visibility-dialog',
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
    MatInputModule,
    MatButtonModule,
  ],
  templateUrl: './visibility-dialog.component.html',
})
export class VisibilityDialogComponent {
  private readonly fb = inject(FormBuilder);
  private readonly dialogRef = inject(MatDialogRef<VisibilityDialogComponent>);
  readonly data = inject<VisibilityDialogData>(MAT_DIALOG_DATA);

  readonly keywords = [...this.data.keywords];
  newKeyword = '';

  readonly form = this.fb.nonNullable.group({
    visibility: [this.data.visibility],
    show_final_grade: [this.data.showFinalGrade],
  });

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
    this.dialogRef.close({
      ...this.form.getRawValue(),
      keywords: this.keywords,
    });
  }

  cancel(): void {
    this.dialogRef.close(null);
  }
}