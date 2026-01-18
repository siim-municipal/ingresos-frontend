import {
  Component,
  input,
  computed,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TimeAgoPipe } from '../pipes/time-ago.pipe';

export interface AuditData {
  createdBy?: string;
  createdAt?: string | Date;
  lastModifiedBy?: string;
  lastModifiedAt?: string | Date;
}

@Component({
  selector: 'lib-audit-info',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatTooltipModule,
    TimeAgoPipe,
    DatePipe,
  ],
  templateUrl: './audit-info.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AuditInfo {
  // Input único que recibe todo el objeto de auditoría
  data = input.required<AuditData>();

  // Computed Signal: Decide qué mostrar
  displayInfo = computed(() => {
    const d = this.data();

    // Si existe fecha de modificación y es diferente a la creación (con un margen de 1 min)
    // asumimos que fue editado.
    const isModified = !!d.lastModifiedAt && !!d.lastModifiedBy;

    return {
      isModified,
      user: isModified ? d.lastModifiedBy : d.createdBy,
      date: isModified ? d.lastModifiedAt : d.createdAt,
    };
  });

  getInitials(name: string | undefined): string {
    if (!name) return '?';
    // Lógica simple: Primer letra o iniciales de "Juan Perez" -> JP
    return name
      .split(' ')
      .map((n) => n[0])
      .slice(0, 2)
      .join('');
  }
}
