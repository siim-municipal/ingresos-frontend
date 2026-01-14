import {
  Component,
  input,
  inject,
  signal,
  ChangeDetectionStrategy,
  ViewEncapsulation,
} from '@angular/core';
import {
  ControlValueAccessor,
  NgControl,
  ReactiveFormsModule,
} from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'gob-input',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatInputModule,
    MatFormFieldModule,
  ],
  templateUrl: './input.html',
  styleUrl: './input.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None, // Para facilitar estilos globales si se requiere
})
export class InputComponent implements ControlValueAccessor {
  // --- Inputs (Configuración) ---
  label = input.required<string>();
  placeholder = input<string>('');
  type = input<string>('text'); // text, email, password, number
  hint = input<string>('');

  // --- Estado Interno ---
  value = signal('');
  isDisabled = signal(false);

  // --- Inyección de Dependencias (El Truco Pro) ---
  /**
   * Nos inyectamos a nosotros mismos el control del formulario padre.
   * Esto nos permite leer los validadores (Validators.required, etc.)
   * sin tener que pasarlos como inputs.
   */
  private ngControl = inject(NgControl, { optional: true, self: true });

  constructor() {
    if (this.ngControl) {
      // Conectamos este componente con el sistema de formularios de Angular
      this.ngControl.valueAccessor = this;
    }
  }

  // --- API ControlValueAccessor (El contrato con Angular Forms) ---

  // Angular nos manda un valor (ej: setValue en el padre)
  writeValue(val: string): void {
    this.value.set(val || '');
  }

  // Angular nos pide notificarle cambios
  registerOnChange(fn: (val: string) => void): void {
    this.onChange = fn;
  }

  // Angular nos pide notificarle cuando el usuario "toca" el input (blur)
  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  // Angular nos dice si debemos deshabilitarnos
  setDisabledState(isDisabled: boolean): void {
    this.isDisabled.set(isDisabled);
  }

  // Funciones placeholder que Angular reemplazará
  private onChange: (val: string) => void = () => {
    /* empty */
  };
  private onTouched: () => void = () => {
    /* empty */
  };

  // --- Eventos del DOM ---

  onInput(event: Event): void {
    const val = (event.target as HTMLInputElement).value;
    this.value.set(val);
    this.onChange(val); // Avisamos al padre que el valor cambió
  }

  onBlur(): void {
    this.onTouched(); // Avisamos al padre que el campo fue "tocado" (para activar validaciones)
  }

  // --- Lógica de Errores Centralizada ---

  get hasError(): boolean {
    // Mostramos error solo si es inválido Y el usuario ya interactuó con él
    return (
      !!this.ngControl?.invalid &&
      (!!this.ngControl?.touched || !!this.ngControl?.dirty)
    );
  }

  get errorMessage(): string {
    const errors = this.ngControl?.errors;
    if (!errors) return '';

    // Mapa de mensajes de error estándar para todo el gobierno
    if (errors['required']) return 'Este campo es requerido.';
    if (errors['email']) return 'El formato de correo es incorrecto.';
    if (errors['minlength'])
      return `Mínimo ${errors['minlength'].requiredLength} caracteres.`;
    if (errors['maxlength'])
      return `Máximo ${errors['maxlength'].requiredLength} caracteres.`;
    if (errors['pattern']) return 'El formato no es válido.';

    return 'Dato inválido.';
  }
}
