import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { CalculoService } from '../services/calculo.service';
import { ShoppingBagStore } from '@gob-ui/sales';

@Component({
  selector: 'lib-detalle-adeudo',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule, MatDividerModule],
  templateUrl: './detalle-adeudo.html',
  styleUrl: './detalle-adeudo.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DetalleAdeudo {
  // --- INJECTIONS ---
  private calculoService = inject(CalculoService);
  private shoppingStore = inject(ShoppingBagStore);

  // --- SIGNALS ---
  // Consumimos los estados reactivos del servicio
  data = this.calculoService.estadoCuenta;
  loading = this.calculoService.isLoading;
  error = this.calculoService.error;

  // --- ACTIONS ---
  agregarAlCarrito(): void {
    const cuenta = this.data();

    if (cuenta) {
      this.shoppingStore.addItem(cuenta);

      // Opcional: Aquí podrías agregar un Toast/SnackBar de confirmación
      console.log('Agregado al carrito:', cuenta.folio);
    }
  }

  /**
   * Helper para extraer metadatos numéricos de forma segura para el template.
   * Evita el error TS2769 con el CurrencyPipe.
   */
  asNumber(val: string | number | object | undefined): number {
    if (typeof val === 'number') return val;
    if (typeof val === 'string') return parseFloat(val);
    return 0; // Fallback seguro
  }
}
