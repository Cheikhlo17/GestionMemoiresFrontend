import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { Supervisor } from '../../../../core/models/supervisor.model';
import { LookupService } from '../../../../core/services/lookup.service';

export interface AssignSupervisorDialogData {
  departmentId: number;
  currentSupervisorId: number | null;
}

@Component({
  selector: 'app-assign-supervisor-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatSelectModule,
    MatButtonModule,
  ],
  templateUrl: './assign-supervisor-dialog.component.html',
})
export class AssignSupervisorDialogComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly lookupService = inject(LookupService);
  private readonly dialogRef = inject(MatDialogRef<AssignSupervisorDialogComponent>);
  readonly data = inject<AssignSupervisorDialogData>(MAT_DIALOG_DATA);

  readonly supervisors = signal<Supervisor[]>([]);

  readonly form = this.fb.nonNullable.group({
    supervisor_id: [this.data.currentSupervisorId, [Validators.required]],
  });

  ngOnInit(): void {
    this.lookupService
      .supervisors(this.data.departmentId)
      .subscribe((res) => this.supervisors.set(res.data));
  }

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