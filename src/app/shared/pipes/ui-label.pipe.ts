import { Pipe, PipeTransform } from '@angular/core';

const LABELS: Record<string, string> = {
  draft: 'Brouillon',
  submitted: 'Soumis',
  under_review: 'En cours d’examen',
  revision_required: 'Corrections demandées',
  approved: 'Approuvé',
  rejected: 'Refusé',
  archived: 'Archivé',
  active: 'Actif',
  graduated: 'Diplômé',
  suspended: 'Suspendu',
  withdrawn: 'Retiré',
  scheduled: 'Programmée',
  completed: 'Terminée',
  cancelled: 'Annulée',
  postponed: 'Reportée',
  pass: 'Validé',
  pass_with_revisions: 'Validé sous réserve de corrections',
  fail: 'Non validé',
  president: 'Président',
  examiner: 'Examinateur',
  reporter: 'Rapporteur',
  administrator: 'Administrateur',
  'head-of-department': 'Chef de département',
  supervisor: 'Encadrant',
  'jury-member': 'Membre du jury',
  student: 'Étudiant',
  bachelor: 'Licence',
  master: 'Master',
  phd: 'Doctorat',
};

@Pipe({ name: 'uiLabel', standalone: true })
export class UiLabelPipe implements PipeTransform {
  transform(value: string | null | undefined): string {
    if (!value) return '';
    return LABELS[value] ?? value.replaceAll('_', ' ');
  }
}