import { computed, effect, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import {
  patchState,
  signalStore,
  withComputed,
  withHooks,
  withMethods,
  withState,
} from '@ngrx/signals';
import {
  CartItem,
  CartItemInput,
  ShoppingBagState,
} from '../models/shopping-bag.models';
import { FeedbackService } from '@gob-ui/shared/services';

const STORAGE_KEY = 'gob_shopping_bag_v1';

const initialState: ShoppingBagState = {
  items: [],
  isOpen: false,
};

/**
 * Helper para sumar montos monetarios evitando errores de punto flotante.
 * Ejemplo: 0.1 + 0.2 = 0.3 (en lugar de 0.300000004)
 */
const safeSum = (items: CartItem[], field: keyof CartItem): number => {
  const totalCentavos = items.reduce((acc, item) => {
    const valor = Number(item[field]) || 0;
    return acc + Math.round(valor * 100);
  }, 0);
  return totalCentavos / 100;
};

export const ShoppingBagStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),

  withComputed(({ items }) => ({
    count: computed(() => items().length),

    totalGeneral: computed(() => safeSum(items(), 'granTotal')),
    impuestosTotal: computed(() => safeSum(items(), 'subtotal')),
    recargosTotal: computed(() => safeSum(items(), 'totalRecargos')),

    hasItems: computed(() => items().length > 0),
  })),

  withMethods((store) => {
    const platformId = inject(PLATFORM_ID);
    const feedback = inject(FeedbackService);

    return {
      addItem(item: CartItemInput): void {
        const currentItems = store.items();

        // ✅ MEJORA: Validación por UUID (predioId) es más segura que por Folio
        const exists = currentItems.some(
          (i) =>
            (item['predioId'] && i['predioId'] === item['predioId']) ||
            i.folio === item.folio,
        );

        if (exists) {
          feedback.warning(
            `El predio con folio ${item.folio} ya está en el carrito.`,
          );
          return;
        }

        const newItem: CartItem = {
          ...item,
          addedAt: Date.now(),
        } as CartItem;

        patchState(store, {
          items: [...currentItems, newItem],
          isOpen: true,
        });

        // Feedback visual amigable
        const conceptos = item.listaConceptos;
        const nombreConcepto =
          Array.isArray(conceptos) && conceptos.length > 0
            ? conceptos[0].descripcion
            : 'Concepto General';

        feedback.success(`Agregado: ${nombreConcepto}`);
      },

      removeItem(identificador: string): void {
        // Permite borrar por predioId (ideal) o folio (fallback)
        patchState(store, (state) => ({
          items: state.items.filter(
            (i) => i['predioId'] !== identificador && i.folio !== identificador,
          ),
        }));
        feedback.info('Concepto eliminado del carrito.');
      },

      clearCart(): void {
        if (store.items().length === 0) return;
        patchState(store, { items: [] });
        // No mostramos mensaje aquí porque suele usarse tras un cobro exitoso
      },

      toggleCart(): void {
        patchState(store, (state) => ({ isOpen: !state.isOpen }));
      },

      // Método interno para hidratar el estado
      _loadFromStorage(): void {
        if (isPlatformBrowser(platformId)) {
          // ✅ MEJORA: Usamos localStorage para persistencia real
          const stored = localStorage.getItem(STORAGE_KEY);
          if (stored) {
            try {
              const items = JSON.parse(stored) as CartItem[];
              patchState(store, { items });
            } catch (e) {
              console.error('Error al leer el carrito local', e);
              localStorage.removeItem(STORAGE_KEY);
            }
          }
        }
      },
    };
  }),

  withHooks({
    onInit(store) {
      // 1. Cargar estado guardado
      store._loadFromStorage();

      const platformId = inject(PLATFORM_ID);

      // 2. Sincronizar cambios automáticamente
      effect(() => {
        const items = store.items();
        if (isPlatformBrowser(platformId)) {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
        }
      });
    },
  }),
);
