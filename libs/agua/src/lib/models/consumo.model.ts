export interface HistorialLecturaDTO {
  periodo: string; // "2024-01"
  consumoM3: number;
  importePagado: number;
  fechaLectura: string;
}

export interface ChartState {
  status: 'loading' | 'success' | 'error' | 'empty';
  error?: string;
}
