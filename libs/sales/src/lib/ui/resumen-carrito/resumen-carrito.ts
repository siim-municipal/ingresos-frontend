import {
  Component,
  inject,
  ChangeDetectionStrategy,
  OnInit,
  OnDestroy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatBadgeModule } from '@angular/material/badge';
import { ShoppingBagStore } from '../../stores/shopping-bag.store';
import {
  HotkeysService,
  AppHotkey,
  FeedbackService,
} from '@gob-ui/shared/services';
import { MatDialog } from '@angular/material/dialog';
import { Subscription } from 'rxjs';
import { CobroModalComponent, CobroResult } from '../cobro-modal/cobro-modal';

@Component({
  selector: 'lib-resumen-carrito',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule, MatBadgeModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './resumen-carrito.html',
  styleUrl: './resumen-carrito.scss',
})
export class ResumenCarrito implements OnInit, OnDestroy {
  readonly store = inject(ShoppingBagStore);
  private dialog = inject(MatDialog);
  private hotkeys = inject(HotkeysService);
  private feedback = inject(FeedbackService);
  private sub = new Subscription();

  abrirModalCobro(): void {
    if (this.store.items().length === 0) {
      this.feedback.warning('Agregue conceptos antes de cobrar.');
      return;
    }

    // Evitar abrir múltiples modales
    if (this.dialog.openDialogs.length > 0) return;

    const dialogRef = this.dialog.open(CobroModalComponent, {
      width: '500px',
      disableClose: true, // Obliga a usar ESC o botones, evita clics fuera por error
      data: {
        totalPagar: this.store.totalGeneral(),
        folio: 'VTA-' + Date.now().toString().slice(-6),
      },
    });

    dialogRef.afterClosed().subscribe((resultado: CobroResult | undefined) => {
      if (resultado?.confirmado) {
        this.procesarPagoFinal(resultado);
      }
      // Al cerrar, regresamos el foco al body o al input de búsqueda si se desea
    });
  }

  limpiarCarritoConConfirmacion(): void {
    // Implementar lógica de confirmación simple o directa
    this.store.clearCart();
  }

  removeItem(event: Event, folio: string): void {
    event.stopPropagation(); // Evitar que el click cierre/abra el panel
    this.store.removeItem(folio);
  }

  procesarPagoFinal(datosPago: CobroResult): void {
    console.log('Iniciando flujo de pago con items:', this.store.items());
    this.store.clearCart();
    const cambio = datosPago.cambio || 0;
    this.feedback.success(
      `Referencia: ${datosPago.referencia || 'N/A'} - Cambio: $${cambio.toFixed(2)}`,
    );

    // TODO: Navegar a pantalla de impresión de ticket o recargar dashboard
  }

  ngOnInit(): void {
    // Escuchar Teclas Globales
    this.sub.add(
      this.hotkeys.hotkey$.subscribe((key) => {
        switch (key) {
          case AppHotkey.OPEN_PAYMENT:
            this.abrirModalCobro();
            break;
          case AppHotkey.CLEAR_CART:
            this.limpiarCarritoConConfirmacion();
            break;
          // F2 lo escuchará el componente del Buscador, no este.
        }
      }),
    );
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }
}
