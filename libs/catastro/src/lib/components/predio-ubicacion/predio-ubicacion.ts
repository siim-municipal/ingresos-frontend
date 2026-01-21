import { Component, computed, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { GobMap } from '@gob-ui/components';

@Component({
  selector: 'lib-predio-ubicacion',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule, GobMap],
  templateUrl: './predio-ubicacion.html',
})
export class PredioUbicacion {
  lat = input<number | undefined>();
  lon = input<number | undefined>();

  // Computed Signal: Transforma los inputs individuales al formato que espera el mapa
  coordinates = computed(() => {
    const lat = this.lat();
    const lon = this.lon();
    console.log({ lat, lon });

    return lat && lon ? ([lat, lon] as [number, number]) : null;
  });
}
