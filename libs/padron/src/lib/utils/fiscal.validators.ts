import {
  AbstractControl,
  ValidationErrors,
  ValidatorFn,
  AsyncValidatorFn,
} from '@angular/forms';
import { Observable, of, timer } from 'rxjs';
import { map, switchMap, catchError, first } from 'rxjs/operators';
import { ContribuyenteApiService } from '../services/contribuyente-api.service';

export class FiscalValidators {
  // Regex Oficiales (SAT México)
  static readonly RFC_FISICA =
    /^([A-ZÑ&]{4}) ?(?:- ?)?(\d{2}(?:0[1-9]|1[0-2])(?:0[1-9]|[12]\d|3[01])) ?(?:- ?)?([A-Z\d]{2})([A\d])$/;
  static readonly RFC_MORAL =
    /^([A-ZÑ&]{3}) ?(?:- ?)?(\d{2}(?:0[1-9]|1[0-2])(?:0[1-9]|[12]\d|3[01])) ?(?:- ?)?([A-Z\d]{2})([A\d])$/;
  static readonly CURP =
    /^[A-Z]{1}[AEIOU]{1}[A-Z]{2}[0-9]{2}(0[1-9]|1[0-2])(0[1-9]|1[0-9]|2[0-9]|3[0-1])[HM]{1}(AS|BC|BS|CC|CS|CH|CL|CM|DF|DG|GT|GR|HG|JC|MC|MN|MS|NT|NL|OC|PL|QT|QR|SP|SL|SR|TC|TS|TL|VZ|YN|ZS|NE)[B-DF-HJ-NP-TV-Z]{3}[0-9A-Z]{1}[0-9]{1}$/;

  /**
   * Validador Síncrono: Verifica formato de RFC según tipo de persona
   */
  static rfcFormat(tipoPersonaControlName: string): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.parent) return null;

      const tipo = control.parent.get(tipoPersonaControlName)?.value;
      const rfc = control.value?.toUpperCase() || '';

      if (!rfc) return null; // Dejar que 'required' maneje el vacío

      const isValid =
        tipo === 'FISICA'
          ? FiscalValidators.RFC_FISICA.test(rfc)
          : FiscalValidators.RFC_MORAL.test(rfc);

      return isValid ? null : { rfcInvalido: { tipo, actual: rfc } };
    };
  }

  /**
   * Validador Asíncrono: Verifica unicidad en Backend
   * Usa 'timer' para debounce manual si no se usa updateOn: 'blur'
   */
  static uniqueRfc(api: ContribuyenteApiService): AsyncValidatorFn {
    return (control: AbstractControl): Observable<ValidationErrors | null> => {
      if (!control.value || control.invalid) {
        return of(null); // No validar si está vacío o ya tiene error de formato
      }

      return timer(500).pipe(
        // Debounce de 500ms
        switchMap(() => api.verificarExistenciaRfc(control.value)),
        map((existe) => (existe ? { rfcDuplicado: true } : null)),
        catchError(() => of(null)), // En caso de error de red, no bloqueamos (o mostramos warning)
        first(), // Importante para completar el observable
      );
    };
  }
}
