import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { ThesisArchivePublic } from '../../../../core/models/thesis-archive.model';
import { ArchiveService } from '../../../../core/services/archive.service';

@Component({
  selector: 'app-archive-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, MatCardModule, MatButtonModule, MatIconModule, MatChipsModule],
  templateUrl: './archive-detail.component.html',
  styleUrl: './archive-detail.component.scss', 
})
export class ArchiveDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly archiveService = inject(ArchiveService);

  readonly archive = signal<ThesisArchivePublic | null>(null);
  readonly isLoading = signal(false);
  readonly isDownloading = signal(false);
  readonly notFound = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly downloadError = signal<string | null>(null);

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!Number.isInteger(id) || id < 1) {
      this.notFound.set(true);
      return;
    }

    this.isLoading.set(true);

    this.archiveService.get(id).subscribe({
      next: (res) => {
        this.archive.set(res.data);
        this.isLoading.set(false);
      },
      error: (error: HttpErrorResponse) => {
        if (error.status === 404) {
          this.notFound.set(true);
        } else {
          this.errorMessage.set('Impossible de charger cette archive. Veuillez réessayer.');
        }
        this.isLoading.set(false);
      },
    });
  }

  download(): void {
    const archive = this.archive();
    if (!archive?.can_download || this.isDownloading()) return;

    this.isDownloading.set(true);
    this.downloadError.set(null);
    this.archiveService.downloadBlob(archive.id).subscribe({
      next: (blob) => {
        this.isDownloading.set(false);
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `memoire-${archive.id}.pdf`;
        link.click();
        window.URL.revokeObjectURL(url);
      },
      error: () => {
        this.isDownloading.set(false);
        this.downloadError.set('Le téléchargement a échoué. Veuillez réessayer.');
      },
    });
  }
}