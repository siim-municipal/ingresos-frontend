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
import { ShoppingBagStore } from '@gob-ui/sales-data';
import {
  HotkeysService,
  AppHotkey,
  FeedbackService,
} from '@gob-ui/shared/services';
import { MatDialog } from '@angular/material/dialog';
import { Subscription } from 'rxjs';
import { CobroModalComponent, CobroResult } from '../cobro-modal/cobro-modal';
import { PaymentOrchestratorService } from '../../services/payment-orchestrator.service';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'lib-resumen-carrito',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatBadgeModule,
    MatProgressSpinnerModule,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './resumen-carrito.html',
  styleUrl: './resumen-carrito.scss',
})
export class ResumenCarrito implements OnInit, OnDestroy {
  readonly store = inject(ShoppingBagStore);
  private dialog = inject(MatDialog);
  private hotkeys = inject(HotkeysService);
  private feedback = inject(FeedbackService);
  private paymentOrchestrator = inject(PaymentOrchestratorService);
  private sub = new Subscription();
  isProcessing = this.paymentOrchestrator.isProcessing;

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
    this.paymentOrchestrator.procesarTransaccion(datosPago);
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
