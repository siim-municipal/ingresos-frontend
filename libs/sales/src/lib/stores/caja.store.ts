import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import { inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, tap } from 'rxjs';
import { API_BASE_URL } from '@gob-ui/shared/services';

export interface CajaState {
  sesionId: string | null;
  isOpen: boolean;
  montoApertura: number;
  totalVendido: number;
  cajasDisponibles: CajaCatalogo[];
  isLoading: boolean;
}

export interface CajaCatalogo {
  id: string;
  nombre: string;
  ubicacion: string;
  activa: boolean;
}

const initialState: CajaState = {
  sesionId: localStorage.getItem('sesion_caja_id'),
  isOpen: !!localStorage.getItem('sesion_caja_id'),
  montoApertura: 0,
  totalVendido: 0, // Inicia en 0
  cajasDisponibles: [],
  isLoading: false,
};

export const CajaStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withMethods((store) => {
    const http = inject(HttpClient);
    const baseURl = inject(API_BASE_URL);
    const apiUrl = `${baseURl}/v1/cajas`;

    return {
      loadCajasDisponibles: (): void => {
        http.get<CajaCatalogo[]>(`${apiUrl}/disponibles`).subscribe((res) => {
          patchState(store, { cajasDisponibles: res });
        });
      },

      abrirCaja: (
        cajaId: string,
        monto: number,
      ): Observable<{ sesionId: string }> => {
        const payload = {
          cajaId: cajaId, // Ahora enviamos el UUID
          saldoInicial: monto, // Coincide con BigDecimal saldoInicial del Java record
        };
        return http
          .post<{
            sesionId: string;
          }>(`${apiUrl}/apertura`, payload)
          .pipe(
            tap((res) => {
              localStorage.setItem('caja_sesion_id', res.sesionId);
              patchState(store, {
                sesionId: res.sesionId,
                isOpen: true,
                montoApertura: monto,
              });
            }),
          );
      },

      cerrarCaja: (): Observable<object> => {
        const id = store.sesionId();
        if (!id) return of();

        // Endpoint basado en CajaController.java
        return http.post(`${apiUrl}/cierre/${id}`, {}).pipe(
          tap(() => {
            localStorage.removeItem('caja_sesion_id');
            patchState(store, { sesionId: null, isOpen: false });
          }),
        );
      },

      registrarVenta: (monto: number): void => {
        patchState(store, (state) => ({
          totalVendido: state.totalVendido + monto,
        }));
      },

      cerrarSesionLocal: (): void => {
        // 1. Limpiar Storage
        localStorage.removeItem('sesion_caja_id');

        // 2. Resetear Estado a valores iniciales
        patchState(store, {
          sesionId: null,
          isOpen: false,
          montoApertura: 0,
          totalVendido: 0,
          isLoading: false,
        });
      },

      // Método para recuperar sesión al recargar página (opcional, validar con backend si sigue viva)
      checkSessionStatus: (): void => {
        // TODO Lógica para verificar si el token/sesión sigue válido
      },
    };
  }),
);
