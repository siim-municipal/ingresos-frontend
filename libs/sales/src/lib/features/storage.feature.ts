import { effect, inject, PLATFORM_ID, Signal } from '@angular/core'; // 👈 Importar Signal
import { isPlatformBrowser } from '@angular/common';
import { signalStoreFeature, withHooks, withState } from '@ngrx/signals';

export function withLocalStorage<T>(key: string, initialValue: T) {
  return signalStoreFeature(
    withState(() => {
      const platformId = inject(PLATFORM_ID);
      if (isPlatformBrowser(platformId)) {
        const stored = localStorage.getItem(key);
        return { [key]: stored ? JSON.parse(stored) : initialValue };
      }
      return { [key]: initialValue };
    }),
    withHooks({
      onInit(store) {
        const platformId = inject(PLATFORM_ID);

        if (isPlatformBrowser(platformId)) {
          effect(() => {
            const storeSignals = store as Record<string, Signal<T>>;
            const state = storeSignals[key]();

            localStorage.setItem(key, JSON.stringify(state));
          });
        }
      },
    }),
  );
}
