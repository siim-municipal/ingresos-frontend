// features/captura-lecturas/captura-lecturas.component.ts
import {
  Component,
  OnInit,
  inject,
  viewChild,
  ChangeDetectionStrategy,
} from '@angular/core';
import {
  ScrollingModule,
  CdkVirtualScrollViewport,
} from '@angular/cdk/scrolling';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LecturaBatchService } from '../../services/lectura-batch.service';

@Component({
  selector: 'lib-captura-lecturas',
  standalone: true,
  imports: [CommonModule, ScrollingModule, FormsModule],
  templateUrl: './captura-lecturas.html',
  styleUrl: './captura-lecturas.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CapturaLecturas implements OnInit {
  service = inject(LecturaBatchService);
  viewport = viewChild(CdkVirtualScrollViewport);

  ngOnInit(): void {
    this.service.loadLecturas();
  }

  // Lógica "Excel-like"
  handleKey(event: KeyboardEvent, currentIndex: number): void {
    const total = this.service.rows().length;
    let nextIndex = -1;

    if (event.key === 'Enter' || event.key === 'ArrowDown') {
      event.preventDefault();
      nextIndex = currentIndex + 1;
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      nextIndex = currentIndex - 1;
    }

    if (nextIndex >= 0 && nextIndex < total) {
      this.focusRow(nextIndex);
    }
  }

  private focusRow(index: number): void {
    // 1. Asegurar que la fila esté renderizada por el Virtual Scroll
    this.viewport()?.scrollToIndex(index);

    // 2. Dar tiempo al ciclo de renderizado (microtask) para que el DOM exista
    requestAnimationFrame(() => {
      const inputId = `reading-input-${index}`;
      const element = document.getElementById(inputId) as HTMLInputElement;
      if (element) {
        element.focus();
        element.select(); // UX: Seleccionar todo el texto para re-escritura rápida
      }
    });
  }

  hayErrores(): boolean {
    // Computed derivado para deshabilitar botón si hay negativos no resueltos
    // Nota: Esto podría optimizarse en el servicio con un computed global
    return this.service.rows().some((r) => r.esNegativo());
  }

  procesar(): void {
    this.service.saveBatch();
  }
}
