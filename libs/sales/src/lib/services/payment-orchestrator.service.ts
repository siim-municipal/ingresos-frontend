import { Injectable, inject, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { finalize, tap, catchError, throwError } from 'rxjs';
import { CobroResult } from '../ui/cobro-modal/cobro-modal';
import { ShoppingBagStore } from '../stores/shopping-bag.store';
import { FeedbackService } from '@gob-ui/shared/services';
import {
  IntencionPagoRequest,
  TesoreriaApiService,
} from './tesoreria-api.service';
import { HttpErrorResponse } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class PaymentOrchestratorService {
  private api = inject(TesoreriaApiService);
  private store = inject(ShoppingBagStore);
  private router = inject(Router);
  private feedback = inject(FeedbackService);

  // Estado reactivo de bloqueo
  private _isProcessing = signal(false);
  public isProcessing = computed(() => this._isProcessing());

  /**
   * Ejecuta el flujo transaccional de cobro.
   * @param cobroData Datos capturados en el Modal (Método pago, monto, etc)
   */
  async procesarTransaccion(cobroData: CobroResult): Promise<void> {
    // 1. Check de Seguridad (Doble Clic)
    if (this._isProcessing()) {
      return;
    }

    // 2. Bloqueo de UI
    this._isProcessing.set(true);
    const loadingToastId = this.feedback.loading(
      'Procesando pago con Tesorería...',
      { duration: 0 },
    );

    try {
      // 3. Preparación del Payload (Mapeo CartItem -> IntencionPagoDTO)
      // NOTA: Como el backend recibe UN solo concepto por DTO, aquí iteramos
      // o tomamos el primero. Para este ejemplo, asumimos pago unitario o consolidado.
      const items = this.store.items();

      // Validamos que haya items
      if (items.length === 0) throw new Error('El carrito está vacío');

      // Simulamos procesamiento secuencial (Si el backend no soporta Bulk)
      for (const item of items) {
        const payload: IntencionPagoRequest = {
          paymentRequestUUID: crypto.randomUUID(), // IDEMPOTENCIA: Generado en cliente
          contribuyenteId:
            (item['contribuyenteId'] as string) || 'ANONYMOUS-UUID', // Debería venir del item o sesión
          sesionCajaId: 'caja-sesion-actual-uuid', // Idealmente inyectado desde un AuthService
          claveConcepto: 'IMP_PREDIAL_URBANO', // TODO Debería mapearse del item.clave
          montoTotal: item.granTotal,
          referenciaId: item.folio, // UUID del Predio
          anioFiscal: new Date().getFullYear(), // O el del item
        };

        // 4. Consumo de API
        // Convertimos Observable a Promise para usar await limpio en el for-loop
        await new Promise((resolve, reject) => {
          this.api.procesarPago(payload).subscribe({
            next: (res) => resolve(res),
            error: (err) => reject(err),
          });
        });
      }

      // 5. Éxito
      this.feedback.dismiss(loadingToastId);
      this.feedback.success(
        'Transacción Aprobada',
        'El recibo se ha generado correctamente.',
      );

      this.store.clearCart(); // Limpieza estado local
      this.router.navigate(['/caja/recibo/ultimo']); // Redirección
    } catch (error: unknown) {
      // 6. Manejo de Errores
      this.feedback.dismiss(loadingToastId);
      console.error('Error en pago', error);

      // Manejo específico según status del backend
      if (error instanceof HttpErrorResponse) {
        if (error.status === 409) {
          this.feedback.error(
            'Conflicto detectado',
            'El monto ha cambiado o ya fue pagado.',
          );
        } else {
          this.feedback.error(
            'Error en Tesorería',
            `Código: ${error.status} - No se pudo procesar el cobro.`,
          );
        }
      } else {
        // Error genérico (ej. "El carrito está vacío" o error de red sin status)
        this.feedback.error(
          'Error Inesperado',
          error instanceof Error
            ? error.message
            : 'Ocurrió un error desconocido',
        );
      }
    } finally {
      // 7. Liberación de UI (Siempre se ejecuta)
      this._isProcessing.set(false);
    }
  }
}
