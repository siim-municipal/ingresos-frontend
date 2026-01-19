export class CurrencyUtil {
  /**
   * Suma una lista de montos asegurando precisión decimal.
   * Convierte a centavos (enteros), suma y regresa a decimal.
   * Evita problemas como 0.1 + 0.2 = 0.30000000000000004
   */
  static sumarMontos(montos: number[]): number {
    const totalCentavos = montos.reduce((acc, monto) => {
      // Math.round corrige pequeños errores de representacion antes de operar
      const centavos = Math.round(monto * 100);
      return acc + centavos;
    }, 0);

    return totalCentavos / 100;
  }

  /**
   * Calcula el cambio a entregar.
   * Lanza error si el pago es insuficiente (Validación de dominio).
   */
  static calcularCambio(totalCobrar: number, pagoEntregado: number): number {
    const totalC = Math.round(totalCobrar * 100);
    const pagoC = Math.round(pagoEntregado * 100);

    if (pagoC < totalC) {
      throw new Error('El pago es insuficiente para cubrir el total.');
    }

    return (pagoC - totalC) / 100;
  }
}
