import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog } from '@angular/material/dialog';
import { CajaStore } from '../../stores/caja.store';
import { AperturaCajaDialog } from '../apertura-caja/apertura-caja.dialog';
import { FeedbackService } from '@gob-ui/shared/services';

@Component({
  selector: 'lib-estado-caja-widget',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule],
  templateUrl: './estado-caja.widget.html',
})
export class EstadoCajaWidget {
  store = inject(CajaStore);
  private dialog = inject(MatDialog);
  private feedback = inject(FeedbackService);

  abrirModal(): void {
    this.dialog.open(AperturaCajaDialog, {
      width: '400px',
      disableClose: true,
    });
  }

  cerrarSesion(): void {
    if (confirm('¿Seguro que desea realizar el corte y cerrar sesión?')) {
      this.store.cerrarCaja().subscribe(() => {
        this.feedback.info(
          'Sesión Cerrada',
          'Se ha generado el corte de caja.',
        );
      });
    }
  }
}
