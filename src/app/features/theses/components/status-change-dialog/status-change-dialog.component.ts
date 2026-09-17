import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { ThesisStatus } from '../../../../core/models/thesis.model';

export interface StatusChangeDialogData {
  allowedStatuses: ThesisStatus[];
}

@Component({
  selector: 'app-status-change-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatButtonModule,
  ],
  templateUrl: './status-change-dialog.component.html',
})
export class StatusChangeDialogComponent {
  private readonly fb = inject(FormBuilder);
  private readonly dialogRef = inject(MatDialogRef<StatusChangeDialogComponent>);
  readonly data = inject<StatusChangeDialogData>(MAT_DIALOG_DATA);

  readonly form = this.fb.nonNullable.group({
    status: [null as ThesisStatus | null, [Validators.required]],
    remarks: [''],
  });

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.dialogRef.close(this.form.getRawValue());
  }

  cancel(): void {
    this.dialogRef.close(null);
  }
}