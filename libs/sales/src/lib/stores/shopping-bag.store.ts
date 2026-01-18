import { computed } from '@angular/core';
import {
  patchState,
  signalStore,
  withMethods,
  withState,
  withComputed,
} from '@ngrx/signals';
import { EstadoCuentaView } from '@gob-ui/fiscal';

export interface ShoppingBagItem extends EstadoCuentaView {
  // Podemos extender la interfaz si necesitamos propiedades extra para el carrito
  addedAt: Date;
}

interface ShoppingBagState {
  items: ShoppingBagItem[];
}

const initialState: ShoppingBagState = {
  items: [],
};

export const ShoppingBagStore = signalStore(
  { providedIn: 'root' }, // Singleton disponible en toda la app
  withState(initialState),

  // Computed Signals (Getters derivados)
  withComputed(({ items }) => ({
    count: computed(() => items().length),
    totalAmount: computed(() =>
      items().reduce((acc, item) => acc + item.granTotal, 0),
    ),
    isEmpty: computed(() => items().length === 0),
  })),

  // Methods (Actions)
  withMethods((store) => ({
    addItem(item: EstadoCuentaView): void {
      // Evitar duplicados si es necesario (ej. por folio)
      const exists = store.items().some((i) => i.folio === item.folio);
      if (exists) {
        console.warn('Este cobro ya está en el carrito');
        return;
      }

      patchState(store, (state) => ({
        items: [...state.items, { ...item, addedAt: new Date() }],
      }));
    },

    removeItem(folio: string): void {
      patchState(store, (state) => ({
        items: state.items.filter((i) => i.folio !== folio),
      }));
    },

    clearCart(): void {
      patchState(store, { items: [] });
    },
  })),
);
