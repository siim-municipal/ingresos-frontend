export interface CorteCajaRequest {
  sesionCajaId: string;
  // Map<BigDecimal, Integer> en Java se serializa como objeto en JSON
  // Clave: Denominación (string), Valor: Cantidad (number)
  desgloseEfectivo: Record<string, number>;
  observaciones?: string;
}

export const DENOMINACIONES = [
  { valor: 1000, tipo: 'BILLETE' },
  { valor: 500, tipo: 'BILLETE' },
  { valor: 200, tipo: 'BILLETE' },
  { valor: 100, tipo: 'BILLETE' },
  { valor: 50, tipo: 'BILLETE' },
  { valor: 20, tipo: 'BILLETE' },
  { valor: 10, tipo: 'MONEDA' },
  { valor: 5, tipo: 'MONEDA' },
  { valor: 2, tipo: 'MONEDA' },
  { valor: 1, tipo: 'MONEDA' },
  { valor: 0.5, tipo: 'MONEDA' },
];
