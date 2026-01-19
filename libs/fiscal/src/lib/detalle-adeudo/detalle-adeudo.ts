import {
  Component,
  ChangeDetectionStrategy,
  inject,
  input,
  signal,
  effect,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { CalculoService } from '../services/calculo.service';
import { ShoppingBagStore, CartItemInput } from '@gob-ui/sales';
import { RouterModule } from '@angular/router';
import { ContribuyenteApiService } from '@gob-ui/padron';
import { FeedbackService } from '@gob-ui/shared/services';

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
  private contribuyenteService = inject(ContribuyenteApiService);
  private calculoService = inject(CalculoService);
  private shoppingStore = inject(ShoppingBagStore);
  private feedback = inject(FeedbackService);
  predioId = input<string>();
  ownerId = signal<string>('');
  loadingOwner = signal<boolean>(false);

  // --- SIGNALS ---
  // Consumimos los estados reactivos del servicio
  data = this.calculoService.estadoCuenta;
  loading = this.calculoService.isLoading;
  error = this.calculoService.error;
  errorType = this.calculoService.errorType;

  constructor() {
    effect(() => {
      const id = this.predioId();
      if (id) {
        this.cargarPropietario(id);
      }
    });
  }

  // --- ACTIONS ---
  agregarAlCarrito(): void {
    const cuenta = this.data();
    const contribuyenteId = this.ownerId();
    const uuidPredio = this.predioId();

    console.log('UUID a guardar en carrito:', uuidPredio);

    if (cuenta && uuidPredio) {
      const itemParaCarrito: CartItemInput = {
        ...(cuenta as unknown as CartItemInput), // Mantenemos tu casting actual
        contribuyenteId: contribuyenteId,
        predioId: uuidPredio,
      };

      this.shoppingStore.addItem(itemParaCarrito);
    } else {
      console.error('ERROR CRÍTICO: No tengo el UUID del predio');
    }
  }

  private cargarPropietario(predioId: string): void {
    this.loadingOwner.set(true);

    this.contribuyenteService.getPropietariosPorPredio(predioId).subscribe({
      next: (props) => {
        if (!props || props.length === 0) {
          console.warn('Este predio no tiene propietarios registrados.');
          this.feedback.warning(
            'Predio sin dueño',
            'Debe asignar un propietario antes de cobrar.',
          );
          this.ownerId.set('00000000-0000-0000-0000-000000000000');
          this.loadingOwner.set(false);
          return;
        }

        // Buscamos al responsable
        const responsable = props.find((p) => p.esResponsablePago) || props[0];

        if (responsable?.id) {
          this.ownerId.set(responsable.id);
        } else {
          this.ownerId.set('00000000-0000-0000-0000-000000000000');
        }
        this.loadingOwner.set(false);
      },
      error: (err) => {
        console.error('Error API Propietarios:', err);
        this.ownerId.set('00000000-0000-0000-0000-000000000000');
        this.loadingOwner.set(false);
      },
    });
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
