import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Contribuyente } from '../models/contribuyente.model';

@Component({
  selector: 'lib-contribuyente-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './contribuyente-detail.html',
  styles: [],
})
export class ContribuyenteDetail {
  // 1. INPUT: Recibimos el contribuyente (Obligatorio)
  // Al ser una Signal, en el HTML lo usaremos como contribuyente()
  contribuyente = input.required<Contribuyente>();

  // 2. OUTPUTS: Eventos hacia el padre (Desacoplamiento del Store)
  closeAction = output<void>();
  editAction = output<string>(); // Emitimos el ID por si acaso
}
