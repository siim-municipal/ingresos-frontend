import { Injectable, OnDestroy, inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { Subject, fromEvent, takeUntil } from 'rxjs';

export enum AppHotkey {
  SEARCH_FOCUS = 'F2',
  CLEAR_CART = 'F4',
  OPEN_PAYMENT = 'F10',
  ESCAPE = 'Escape',
  NEW_ITEM = 'F8',
}

@Injectable({ providedIn: 'root' })
export class HotkeysService implements OnDestroy {
  private document = inject(DOCUMENT);
  private destroy$ = new Subject<void>();

  // Stream principal de atajos
  private hotkeySubject = new Subject<AppHotkey>();
  public hotkey$ = this.hotkeySubject.asObservable();

  constructor() {
    this.initListener();
  }

  private initListener(): void {
    fromEvent<KeyboardEvent>(this.document, 'keydown')
      .pipe(takeUntil(this.destroy$))
      .subscribe((event) => {
        // Mapeo de teclas
        switch (event.key) {
          case 'F2':
            this.handleKey(event, AppHotkey.SEARCH_FOCUS);
            break;
          case 'F4':
            this.handleKey(event, AppHotkey.CLEAR_CART);
            break;
          case 'F8':
            this.handleKey(event, AppHotkey.NEW_ITEM);
            break;
          case 'F10':
            this.handleKey(event, AppHotkey.OPEN_PAYMENT);
            break;
          case 'Escape':
            this.handleKey(event, AppHotkey.ESCAPE);
            break;
        }
      });
  }

  private handleKey(event: KeyboardEvent, type: AppHotkey): void {
    // Prevenimos comportamiento default del navegador (ej. F3 buscar, etc)
    // Nota: Algunas teclas como Escape no requieren preventDefault
    if (type !== AppHotkey.ESCAPE) {
      event.preventDefault();
    }
    this.hotkeySubject.next(type);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
