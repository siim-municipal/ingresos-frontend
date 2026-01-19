import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { CajaStore } from '../../stores/caja.store'; // Asegura la ruta
import { FeedbackService } from '@gob-ui/shared/services';
import { MatSelectModule } from '@angular/material/select';

@Component({
  selector: 'lib-apertura-caja-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatSelectModule,
  ],
  templateUrl: './apertura-caja.dialog.html',
})
export class AperturaCajaDialog implements OnInit {
  private dialogRef = inject(MatDialogRef<AperturaCajaDialog>);
  public store = inject(CajaStore);
  private feedback = inject(FeedbackService);

  monto = signal<number>(0);
  loading = signal(false);
  selectedCajaId = signal<string>('');

  ngOnInit(): void {
    // Cargamos el catálogo al abrir el modal
    this.store.loadCajasDisponibles();
  }

  confirmar(): void {
    this.loading.set(true);

    // Llamamos al Store
    this.store.abrirCaja(this.selectedCajaId(), this.monto()).subscribe({
      next: () => {
        this.feedback.success(
          'Caja Abierta',
          'La sesión ha iniciado correctamente.',
        );
        this.dialogRef.close(true);
      },
      error: (err) => {
        console.error(err);
        this.feedback.error('Error', 'No se pudo abrir la caja.');
        this.loading.set(false);
      },
    });
  }

  cancelar(): void {
    this.dialogRef.close(false);
  }
}
