import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatBadgeModule } from '@angular/material/badge';
import { ShoppingBagStore } from '../../stores/shopping-bag.store';

@Component({
  selector: 'lib-resumen-carrito',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule, MatBadgeModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './resumen-carrito.html',
  styleUrl: './resumen-carrito.scss',
})
export class ResumenCarrito {
  readonly store = inject(ShoppingBagStore);

  removeItem(event: Event, folio: string): void {
    event.stopPropagation(); // Evitar que el click cierre/abra el panel
    this.store.removeItem(folio);
  }

  procesarPago(): void {
    console.log('Iniciando flujo de pago con items:', this.store.items());
    // TODO Aquí iría la navegación al checkout o apertura de modal de pago
  }
}
