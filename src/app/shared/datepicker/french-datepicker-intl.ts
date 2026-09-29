import { MatDatepickerIntl } from '@angular/material/datepicker';

export function createFrenchDatepickerIntl(): MatDatepickerIntl {
  const intl = new MatDatepickerIntl();
  intl.calendarLabel = 'Calendrier';
  intl.openCalendarLabel = 'Ouvrir le calendrier';
  intl.closeCalendarLabel = 'Fermer le calendrier';
  intl.prevMonthLabel = 'Mois précédent';
  intl.nextMonthLabel = 'Mois suivant';
  intl.prevYearLabel = 'Année précédente';
  intl.nextYearLabel = 'Année suivante';
  intl.prevMultiYearLabel = 'Période précédente';
  intl.nextMultiYearLabel = 'Période suivante';
  intl.switchToMonthViewLabel = 'Choisir une date';
  intl.switchToMultiYearViewLabel = 'Choisir un mois et une année';
  return intl;
}