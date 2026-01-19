import {
  Component,
  ChangeDetectionStrategy,
  inject,
  input,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { CalculoService } from '../services/calculo.service';
import { ShoppingBagStore, CartItemInput } from '@gob-ui/sales';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'lib-detalle-adeudo',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    RouterModule,
  ],
  templateUrl: './detalle-adeudo.html',
  styleUrl: './detalle-adeudo.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DetalleAdeudo {
  // --- INJECTIONS ---
  private calculoService = inject(CalculoService);
  private shoppingStore = inject(ShoppingBagStore);
  predioId = input<string>();

  // --- SIGNALS ---
  // Consumimos los estados reactivos del servicio
  data = this.calculoService.estadoCuenta;
  loading = this.calculoService.isLoading;
  error = this.calculoService.error;
  errorType = this.calculoService.errorType;

  // --- ACTIONS ---
  agregarAlCarrito(): void {
    const cuenta = this.data();

    if (cuenta) {
      this.shoppingStore.addItem(cuenta as unknown as CartItemInput);

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
  reintentar(): void {
    // TODO Lógica para reintentar (opcional)
  }
}
