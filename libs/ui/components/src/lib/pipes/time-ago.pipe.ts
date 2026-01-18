import { Pipe, PipeTransform, inject, LOCALE_ID } from '@angular/core';
import { DatePipe } from '@angular/common';

@Pipe({
  name: 'timeAgo',
  standalone: true,
})
export class TimeAgoPipe implements PipeTransform {
  private locale = inject(LOCALE_ID); // Obtiene el idioma de la app (es-MX)
  private datePipe = new DatePipe(this.locale);

  transform(value: string | Date | undefined | null): string {
    if (!value) return '';

    const date = new Date(value);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    // Lógica de intervalos
    const intervals = {
      año: 31536000,
      mes: 2592000,
      semana: 604800,
      día: 86400,
      hora: 3600,
      minuto: 60,
      segundo: 1,
    };

    // Si pasó más de 7 días, mostramos fecha absoluta estándar
    if (seconds > intervals.semana) {
      return `el ${this.datePipe.transform(value, 'mediumDate')}`;
    }

    // Si es reciente, calculamos el tiempo relativo
    const rtf = new Intl.RelativeTimeFormat(this.locale.split('-')[0], {
      numeric: 'auto',
    });

    if (seconds < intervals.minuto) return 'hace unos instantes';

    if (seconds < intervals.hora) {
      const minutes = Math.floor(seconds / intervals.minuto);
      return rtf.format(-minutes, 'minute');
    }

    if (seconds < intervals.día) {
      const hours = Math.floor(seconds / intervals.hora);
      return rtf.format(-hours, 'hour');
    }

    const days = Math.floor(seconds / intervals.día);
    return rtf.format(-days, 'day');
  }
}
