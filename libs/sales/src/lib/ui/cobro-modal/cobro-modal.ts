import {
  Component,
  ChangeDetectionStrategy,
  inject,
  signal,
  computed,
  HostListener,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  MatDialogModule,
  MatDialogRef,
  MAT_DIALOG_DATA,
} from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { CurrencyPipe } from '@angular/common';

export interface CobroModalData {
  totalPagar: number;
  folio: string; // Para referencia visual
}

export interface CobroResult {
  confirmado: boolean;
  metodoPago: MetodoPago;
  montoRecibido: number | null;
  referencia: string;
  cambio: number;
}

export type MetodoPago = 'EFECTIVO' | 'TARJETA' | 'CHEQUE';

export interface CobroModalData {
  totalPagar: number;
  folio: string;
}

@Component({
  selector: 'lib-cobro-modal',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatButtonModule,
    MatInputModule,
    MatSelectModule,
    MatIconModule,
    MatFormFieldModule,
    CurrencyPipe,
  ],
  templateUrl: './cobro-modal.html',
  styleUrl: './cobro-modal.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CobroModalComponent {
  private dialogRef = inject(MatDialogRef<CobroModalComponent>);
  public data = inject<CobroModalData>(MAT_DIALOG_DATA);

  // --- Signals State ---
  metodoPago = signal<MetodoPago>('EFECTIVO');
  montoRecibido = signal<number | null>(null);

  // Referencia no necesita ser signal reactivo para cálculos, pero ngModel lo maneja bien
  referencia = '';

  // --- Computed ---
  // Calcula el cambio en tiempo real. Si es negativo, muestra 0 visualmente o negativo para indicar falta.
  cambio = computed(() => {
    const recibido = this.montoRecibido() || 0;
    return recibido - this.data.totalPagar;
  });

  esCambioValido = computed(() => {
    // Es válido si cubre el total (cambio >= 0)
    return this.cambio() >= -0.01; // Margen de error flotante mínimo
  });

  @HostListener('window:keydown.escape')
  onEscKey(): void {
    this.cancelar();
  }

  // --- Actions ---

  esFormularioValido(): boolean {
    if (this.metodoPago() === 'EFECTIVO') {
      return this.esCambioValido();
    }
    // Para otros métodos, requerimos referencia
    return this.referencia.trim().length >= 4;
  }

  intentarCobrar(): void {
    if (this.esFormularioValido()) {
      this.confirmarCobro();
    }
  }

  confirmarCobro(): void {
    const resultado: CobroResult = {
      confirmado: true,
      metodoPago: this.metodoPago(),
      montoRecibido: this.montoRecibido(),
      referencia: this.referencia,
      cambio: this.cambio(),
    };

    this.dialogRef.close(resultado);
  }

  cancelar(): void {
    this.dialogRef.close(null);
  }
}
