import {
  Component,
  ChangeDetectionStrategy,
  inject,
  signal,
  input,
  OnDestroy,
  effect,
} from '@angular/core';
import { CommonModule, CurrencyPipe, DecimalPipe } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatTabsModule, MatTabChangeEvent } from '@angular/material/tabs';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Predio } from '../models/predio.model';
import { PredioPropietarios } from './components/predio-propietarios/predio-propietarios';
import { PredioHistorial } from './components/predio-historial/predio-historial';
import { PredioUbicacion } from './components/predio-ubicacion/predio-ubicacion';
import { AuditInfo } from '@gob-ui/components';
import { CalculoService, SolicitudCalculo } from '@gob-ui/fiscal';
import { DetalleAdeudo } from '@gob-ui/fiscal';
import { TaxConcept } from '@gob-ui/fiscal';

@Component({
  selector: 'lib-predio-detail',
  standalone: true,
  imports: [
    CommonModule,
    MatTabsModule,
    MatButtonModule,
    MatIconModule,
    CurrencyPipe,
    DecimalPipe,
    PredioPropietarios,
    PredioHistorial,
    PredioUbicacion,
    AuditInfo,
    DetalleAdeudo,
  ],
  templateUrl: './predio-detail.html',
  styleUrl: './predio-detail.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PredioDetail implements OnDestroy {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private calculoService = inject(CalculoService);
  predio = input.required<Predio>();

  // ESTADO DE TABS
  readonly tabKeys = [
    'general',
    'propietarios',
    'historial',
    'ubicacion',
    'simulacion',
  ];
  selectedTabIndex = signal(0);

  constructor() {
    effect(() => {
      this.calculoService.resetCalculo();
    });
    // Sincronizar URL -> Tab al iniciar
    // Leemos el query param una sola vez o reaccionamos a él
    this.route.queryParams.subscribe((params) => {
      const tabName = params['tab'];
      const index = this.tabKeys.indexOf(tabName);
      if (index !== -1 && index !== this.selectedTabIndex()) {
        this.selectedTabIndex.set(index);
      }
    });
  }

  // Manejador del cambio de Tab (Tab -> URL)
  onTabChange(event: MatTabChangeEvent): void {
    const newIndex = event.index;
    const tabName = this.tabKeys[newIndex];

    this.selectedTabIndex.set(newIndex);

    // Actualizamos la URL sin recargar la página
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { tab: tabName },
      queryParamsHandling: 'merge', // Mantiene otros params si existieran
      replaceUrl: true, // Evita llenar el historial del navegador con cada click
    });
  }

  ejecutarSimulacion(): void {
    const anioActual = new Date().getFullYear();
    const payload: SolicitudCalculo = {
      referenciaId: this.predio().id,
      cantidad: 1,
      claveConcepto: TaxConcept.PREDIAL_URBANO,
      anioFiscal: anioActual,
      baseCalculo: this.predio().valorCatastral,
      parametrosExtra: undefined,
    };
    this.calculoService.calcularPredial(payload);
  }

  goBack(): void {
    this.router.navigate(['/catastro']);
  }

  ngOnDestroy(): void {
    this.calculoService.resetCalculo();
  }
}
