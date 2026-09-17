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
import { JuryMember } from '../../../../core/models/jury-member.model';
import { LookupService } from '../../../../core/services/lookup.service';

export interface AssignJuryDialogData {
  departmentId: number;
  existingJury: JuryMember[];
}

@Component({
  selector: 'app-assign-jury-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatSelectModule,
    MatButtonModule,
  ],
  templateUrl: './assign-jury-dialog.component.html',
})
export class AssignJuryDialogComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly lookupService = inject(LookupService);
  private readonly dialogRef = inject(MatDialogRef<AssignJuryDialogComponent>);
  readonly data = inject<AssignJuryDialogData>(MAT_DIALOG_DATA);

  readonly juryOptions = signal<JuryMember[]>([]);

  readonly form = this.fb.nonNullable.group({
    president_id: [
      this.data.existingJury.find((j) => j.role === 'president')?.id ?? null,
      [Validators.required],
    ],
    examiner_id: [
      this.data.existingJury.find((j) => j.role === 'examiner')?.id ?? null,
      [Validators.required],
    ],
    reporter_id: [
      this.data.existingJury.find((j) => j.role === 'reporter')?.id ?? null,
      [Validators.required],
    ],
  });

  ngOnInit(): void {
    this.lookupService
      .juryMembers(this.data.departmentId)
      .subscribe((res) => this.juryOptions.set(res.data));
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const raw = this.form.getRawValue();
    const ids = [raw.president_id, raw.examiner_id, raw.reporter_id];

    if (new Set(ids).size !== 3) {
      this.form.setErrors({ duplicate: true });
      return;
    }

    this.dialogRef.close({
      jury: [
        { jury_member_id: raw.president_id, role: 'president' },
        { jury_member_id: raw.examiner_id, role: 'examiner' },
        { jury_member_id: raw.reporter_id, role: 'reporter' },
      ],
    });
  }

  cancel(): void {
    this.dialogRef.close(null);
  }
}