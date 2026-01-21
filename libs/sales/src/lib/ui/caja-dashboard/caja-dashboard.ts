import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { Router, RouterModule } from '@angular/router';

// Material
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatBadgeModule } from '@angular/material/badge';
import { MatTooltipModule } from '@angular/material/tooltip';

// Tus Librerías
import { FeedbackService } from '@gob-ui/shared/services';
import { ShoppingBagStore } from '@gob-ui/sales-data';
// import { Predio } from '@gob-ui/catastro';

export interface Predio {
  id: number;
}

@Component({
  selector: 'lib-caja-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    MatBadgeModule,
    MatTooltipModule,
    CurrencyPipe,
    DatePipe,
    // PredioSearch,
  ],
  templateUrl: './caja-dashboard.html',
  styleUrl: './caja-dashboard.scss',
})
export class CajaDashboard {
  private router = inject(Router);
  public cartStore = inject(ShoppingBagStore); // Store global del carrito
  private feedback = inject(FeedbackService);

  // Estado local para la UI
  fechaActual = signal(new Date());

  // Datos simulados de la sesión (idealmente vendrían de un SessionService)
  cajaInfo = signal({
    numero: 'CAJA-04',
    cajero: 'Juan Pérez',
    turno: 'Matutino',
    estado: 'ABIERTA',
  });

  // Computed para saber si hay algo que cobrar
  tieneItems = computed(() => this.cartStore.count() > 0);

  constructor() {
    // Reloj simple
    setInterval(() => this.fechaActual.set(new Date()), 60000);
  }

  // --- ACTIONS ---

  onPredioSelected(predio: Predio): void {
    // Cuando encuentran un predio, vamos al detalle para calcular adeudos
    // Pasamos ?tab=simulacion para ir directo al cobro
    this.router.navigate(['/catastro/predio', predio.id], {
      queryParams: { tab: 'simulacion' },
    });
  }

  cobrar(): void {
    if (!this.tieneItems()) return;

    // Aquí navegarías a la pantalla de "Checkout" (Selección de método de pago)
    // O abrirías un Modal de Pago
    this.feedback.info('Iniciando proceso de cobro...');
    // this.router.navigate(['/sales/checkout']);
  }

  limpiarVenta(): void {
    if (confirm('¿Está seguro de cancelar la venta actual?')) {
      this.cartStore.clearCart();
    }
  }

  irACorte(): void {
    this.router.navigate(['/sales/corte']);
  }
}
