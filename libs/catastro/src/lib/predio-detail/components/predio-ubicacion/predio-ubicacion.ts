import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'lib-predio-ubicacion',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule],
  templateUrl: './predio-ubicacion.html',
})
export class PredioUbicacion {
  // TODO implementar mapa para poder visualizar las rutas que pueden o no venir en el objeto
  lat = input<number | undefined>();
  lon = input<number | undefined>();

  abrirGoogleMaps(): void {
    if (this.lat() && this.lon()) {
      window.open(
        `https://www.google.com/maps/search/?api=1&query=${this.lat()},${this.lon()}`,
        '_blank',
      );
    }
  }
}
