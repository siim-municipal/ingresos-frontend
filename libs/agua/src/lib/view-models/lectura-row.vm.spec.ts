import { LecturaDTO } from '../models/lectura.model';
import { LecturaRowViewModel } from './lectura-row.vm';

describe('LecturaRowViewModel', () => {
  let mockDTO: LecturaDTO;

  beforeEach(() => {
    mockDTO = {
      id: 1,
      predioDireccion: 'Calle Falsa 123',
      medidorSerie: 'A-100',
      lecturaAnterior: 100, // Anterior es 100
      promedioHistorico: 10,
      lecturaActual: null,
      sinMedidor: false,
    };
  });

  it('debe calcular el consumo correctamente al escribir lectura actual', () => {
    const vm = new LecturaRowViewModel(mockDTO);

    // Acción: Simulamos escribir 115
    vm.actual.set(115);

    // Assert: 115 - 100 = 15
    expect(vm.consumo()).toBe(15);
  });

  it('debe detectar anomalía negativa', () => {
    const vm = new LecturaRowViewModel(mockDTO);

    // Acción: Escribimos 90 (menor a la anterior 100)
    vm.actual.set(90);

    expect(vm.consumo()).toBe(-10);
    expect(vm.esNegativo()).toBeTruthy();
    expect(vm.esValido()).toBeFalsy();
  });

  it('debe detectar anomalía de alto consumo (>300% del promedio)', () => {
    const vm = new LecturaRowViewModel(mockDTO);
    // Promedio es 10. 300% es 30.

    // Caso Normal (20 de consumo)
    vm.actual.set(120);
    expect(vm.esAnomaliaAlta()).toBeFalsy();

    // Caso Alto (50 de consumo, mucho más que 30)
    vm.actual.set(150);
    expect(vm.esAnomaliaAlta()).toBeTruthy();
    // Nota: Según tu regla, puede ser válido para guardar, pero marca warning
    expect(vm.esValido()).toBeTruthy();
  });
});
