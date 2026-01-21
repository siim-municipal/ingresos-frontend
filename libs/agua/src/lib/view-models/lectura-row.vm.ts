// view-models/lectura-row.vm.ts
import { signal, computed, linkedSignal } from '@angular/core';
import { LecturaDTO } from '../models/lectura.model';

export class LecturaRowViewModel {
  // Datos estáticos (readonly)
  readonly id: number;
  readonly direccion: string;
  readonly serie: string;
  readonly anterior: number;
  readonly promedio: number;

  // Estado mutable (Signals)
  // linkedSignal (Angular 19+) permite sincronizar estado inicial y actualizaciones
  actual = signal<number | null>(null);

  // Computed: Cálculo inmediato del consumo
  consumo = computed(() => {
    const act = this.actual();
    if (act === null) return null;
    return act - this.anterior;
  });

  // Computed: Validaciones de negocio
  esNegativo = computed(() => {
    const c = this.consumo();
    return c !== null && c < 0;
  });

  esAnomaliaAlta = computed(() => {
    const c = this.consumo();
    return c !== null && c > this.promedio * 3; // 300% del promedio
  });

  esValido = computed(() => {
    const tieneValor = this.actual() !== null;
    const errorNegativo = this.esNegativo();
    // Permitimos anomalía alta si es real, pero bloqueamos negativos (regla ejemplo)
    return tieneValor && !errorNegativo;
  });

  constructor(dto: LecturaDTO) {
    this.id = dto.id;
    this.direccion = dto.predioDireccion;
    this.serie = dto.medidorSerie;
    this.anterior = dto.lecturaAnterior;
    this.promedio = dto.promedioHistorico;
    // Inicializar si viene del backend
    if (dto.lecturaActual !== null) this.actual.set(dto.lecturaActual);
  }
}
