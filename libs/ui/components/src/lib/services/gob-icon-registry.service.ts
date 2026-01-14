import { Injectable, inject } from '@angular/core';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';

// Definición estricta de iconos disponibles
export type IconName = 'logo_gobierno' | 'usuario' | 'menu' | 'dashboard';

@Injectable({
  providedIn: 'root',
})
export class GobIconRegistryService {
  private readonly _matIconRegistry = inject(MatIconRegistry);
  private readonly _domSanitizer = inject(DomSanitizer);
  private readonly _assetsPath = 'assets/icons'; // Configurar en project.json

  /**
   * Registra el set base de iconos SVG para evitar requests innecesarios
   * y garantizar seguridad con DomSanitizer.
   */
  public registerIcons(): void {
    const icons: IconName[] = ['logo_gobierno', 'usuario', 'menu', 'dashboard'];

    icons.forEach((icon) => {
      this._matIconRegistry.addSvgIcon(
        icon,
        this._domSanitizer.bypassSecurityTrustResourceUrl(
          `${this._assetsPath}/${icon}.svg`,
        ),
      );
    });
  }
}
