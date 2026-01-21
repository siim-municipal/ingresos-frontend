import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CapturaLecturas } from './captura-lecturas';
import { LecturaBatchService } from '../../services/lectura-batch.service';
import { signal, WritableSignal } from '@angular/core';
import { LecturaRowViewModel } from '../../view-models/lectura-row.vm';

describe('CapturaLecturas', () => {
  let component: CapturaLecturas;
  let fixture: ComponentFixture<CapturaLecturas>;
  let mockService: {
    loadLecturas: jest.Mock;
    saveBatch: jest.Mock;
    rows: WritableSignal<LecturaRowViewModel[]>;
    loading: WritableSignal<boolean>;
  };

  beforeEach(async () => {
    mockService = {
      loadLecturas: jest.fn(), // Mock para espiar llamadas
      saveBatch: jest.fn(), // Mock para espiar llamadas
      rows: signal([]), // Signal REAL para reactividad
      loading: signal(false), // Signal REAL
    };

    await TestBed.configureTestingModule({
      imports: [CapturaLecturas],
      providers: [
        // Inyectamos nuestro objeto híbrido
        { provide: LecturaBatchService, useValue: mockService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CapturaLecturas);
    component = fixture.componentInstance;
    // fixture.detectChanges(); // Opcional aquí, depende de tu flujo
  });

  it('debe crear', () => {
    expect(component).toBeTruthy();
  });

  it('debe renderizar filas cuando el servicio tiene datos', () => {
    // Preparar datos de prueba
    const filasMock = [
      new LecturaRowViewModel({
        id: 1,
        predioDireccion: 'Test',
        medidorSerie: 'A1',
        lecturaAnterior: 0,
        promedioHistorico: 0,
        lecturaActual: null,
        sinMedidor: false,
      }),
    ];
    // Como mockService.rows es un WritableSignal real, esto dispara la detección de cambios
    mockService.rows.set(filasMock);

    fixture.detectChanges();

    // Verificación
    expect(component.viewport()?.getDataLength()).toBe(1);
  });

  it('debe llamar a saveBatch al procesar', () => {
    // Configurar estado válido para que el botón se habilite
    const filaValida = new LecturaRowViewModel({
      id: 1,
      predioDireccion: 'T',
      medidorSerie: 'S',
      lecturaAnterior: 10,
      promedioHistorico: 5,
      lecturaActual: 20,
      sinMedidor: false,
    });

    mockService.rows.set([filaValida]);
    fixture.detectChanges();

    // Ejecutar acción
    component.procesar();

    expect(mockService.saveBatch).toHaveBeenCalled();
    // Opcional: verificar número de llamadas
    expect(mockService.saveBatch).toHaveBeenCalledTimes(1);
  });
});
