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

export const ShoppingBagStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),

  withComputed(({ items }) => ({
    count: computed(() => items().length),
    totalGeneral: computed(() =>
      items().reduce((acc, item) => acc + item.granTotal, 0),
    ),
    impuestosTotal: computed(() =>
      items().reduce((acc, item) => acc + item.subtotal, 0),
    ),
    recargosTotal: computed(() =>
      items().reduce((acc, item) => acc + item.totalRecargos, 0),
    ),
    hasItems: computed(() => items().length > 0),
  })),

  withMethods((store) => {
    const platformId = inject(PLATFORM_ID);

    const feedback = inject(FeedbackService);

    return {
      addItem(item: CartItemInput): void {
        const currentItems = store.items();

        if (currentItems.some((i) => i.folio === item.folio)) {
          feedback.warning(
            `El folio ${item['folio']} ya se encuentra en el carrito.`,
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
        const conceptos = item.listaConceptos;
        const nombreConcepto =
          Array.isArray(conceptos) && conceptos.length > 0
            ? conceptos[0].descripcion
            : 'Concepto General';

        feedback.success(`${nombreConcepto} se agregó correctamente.`);
      },

      removeItem(folio: string): void {
        patchState(store, (state) => ({
          items: state.items.filter((i) => i.folio !== folio),
        }));
        feedback.info('Se ha quitado el concepto del carrito.');
      },

      clearCart(): void {
        if (store.items().length === 0) return;
        patchState(store, { items: [] });
        feedback.info('Se han eliminado todos los conceptos.');
      },

      toggleCart(): void {
        patchState(store, (state) => ({ isOpen: !state.isOpen }));
      },

      _loadFromStorage(): void {
        if (isPlatformBrowser(platformId)) {
          const stored = sessionStorage.getItem(STORAGE_KEY);
          if (stored) {
            try {
              const items = JSON.parse(stored) as CartItem[];
              patchState(store, { items });
            } catch (e) {
              console.error('Error corrupt shopping bag data', e);
              sessionStorage.removeItem(STORAGE_KEY);
            }
          }
        }
      },
    };
  }),

  withHooks({
    onInit(store) {
      store._loadFromStorage();
      const platformId = inject(PLATFORM_ID);
      effect(() => {
        const items = store.items();
        if (isPlatformBrowser(platformId)) {
          sessionStorage.setItem(STORAGE_KEY, JSON.stringify(items));
        }
      });
    },
  }),
);
