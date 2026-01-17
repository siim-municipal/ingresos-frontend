import {
  Component,
  inject,
  signal,
  effect,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  Validators,
  FormControl,
} from '@angular/forms';
import { ContribuyenteApiService } from '../services/contribuyente-api.service';
import { FiscalValidators } from '../utils/fiscal.validators';
import { Router } from '@angular/router';
import { ContribuyenteFormInterface } from '../interfaces/contribuyente.form.interface';
import { FeedbackService } from '@gob-ui/shared/services';

@Component({
  selector: 'lib-contribuyente-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './contribuyente-form.html',
  styleUrl: './contribuyente-form.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ContribuyenteForm {
  private fb = inject(FormBuilder);
  private api = inject(ContribuyenteApiService);
  private router = inject(Router);
  private feedback = inject(FeedbackService);

  // Estados UI (Signals)
  isSubmitting = signal(false);
  currentTipo = signal<'FISICA' | 'MORAL'>('FISICA');

  // Inicialización del Formulario Tipado
  form = this.fb.nonNullable.group<ContribuyenteFormInterface>({
    tipoPersona: new FormControl<'FISICA' | 'MORAL'>('FISICA', {
      nonNullable: true,
    }),

    // RFC con validación asíncrona
    rfc: new FormControl<string>('', {
      nonNullable: true,
      validators: [Validators.required], // El formato se valida dinámicamente
      asyncValidators: [FiscalValidators.uniqueRfc(this.api)],
      updateOn: 'blur', // OPTIMIZACIÓN: Solo dispara async validator al salir del campo
    }),

    // Campos Física
    nombre: new FormControl('', { nonNullable: true }),
    apellidoPaterno: new FormControl('', { nonNullable: true }),
    apellidoMaterno: new FormControl('', { nonNullable: true }),
    curp: new FormControl('', { nonNullable: true }),

    // Campos Moral
    razonSocial: new FormControl('', { nonNullable: true }),
    fechaConstitucion: new FormControl('', { nonNullable: true }),

    // Comunes
    codigoPostal: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.pattern(/^\d{5}$/)],
    }),
    calle: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    email: new FormControl('', {
      nonNullable: true,
      validators: [Validators.email],
    }),
    telefonoMovil: new FormControl('', {
      nonNullable: true,
      validators: [Validators.pattern(/^\d{10}$/)],
    }),
  });

  constructor() {
    // Effect para reaccionar a cambios en 'tipoPersona'
    // Reemplaza la suscripción manual a valueChanges
    effect(() => {
      // Nota: En Angular 21, si usamos Signals inputs, esto sería más directo.
      this.form.controls.tipoPersona.valueChanges.subscribe((val) => {
        this.currentTipo.set(val || 'FISICA');
        this.updateValidators(val || 'FISICA');
      });
    });

    // Configuración inicial
    this.updateValidators('FISICA');
  }

  /**
   * Lógica dinámica para activar/desactivar validaciones según Tipo Persona
   */
  private updateValidators(tipo: 'FISICA' | 'MORAL'): void {
    const f = this.form.controls;

    // 1. Actualizar validador de RFC (Formato)
    f.rfc.setValidators([
      Validators.required,
      FiscalValidators.rfcFormat('tipoPersona'),
    ]);
    f.rfc.updateValueAndValidity();

    if (tipo === 'FISICA') {
      // Activar Física
      f.nombre.setValidators([Validators.required]);
      f.apellidoPaterno.setValidators([Validators.required]);
      f.curp.setValidators([
        Validators.required,
        Validators.pattern(FiscalValidators.CURP),
      ]);

      // Desactivar Moral
      f.razonSocial.clearValidators();
      f.fechaConstitucion.clearValidators();

      // Limpiar valores Moral para no enviar basura
      f.razonSocial.reset();
      f.fechaConstitucion.reset();
    } else {
      // Activar Moral
      f.razonSocial.setValidators([Validators.required]);
      f.fechaConstitucion.setValidators([Validators.required]);

      // Desactivar Física
      f.nombre.clearValidators();
      f.apellidoPaterno.clearValidators();
      f.apellidoMaterno.clearValidators();
      f.curp.clearValidators();

      // Limpiar valores Física
      f.nombre.reset();
      f.apellidoPaterno.reset();
      f.curp.reset();
    }

    // Recalcular estado global
    this.form.updateValueAndValidity();
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);
    const formData = this.form.getRawValue();

    // Mapeo al DTO (se podría mover a un Mapper)
    const payload = {
      ...formData,
      // Lógica extra si se requiere
    };

    this.api.registrar(payload).subscribe({
      next: () => {
        this.isSubmitting.set(false);
        this.router.navigate(['/padron']);
        // Mostrar Toast de éxito (vía FeedbackService)
      },
      error: (err) => {
        this.isSubmitting.set(false);
        this.feedback.error('Error al registrar', `Mensaje: ${err}`);
      },
    });
  }

  // Helper para errores en template
  hasError(
    controlName: keyof ContribuyenteFormInterface,
    errorName: string,
  ): boolean {
    const control = this.form.get(controlName);
    return !!(control?.hasError(errorName) && control?.touched);
  }

  // Helper para forzar mayúsculas en inputs específicos
  toUpper(event: Event): void {
    const input = event.target as HTMLInputElement;
    const value = input.value.toUpperCase();

    // Solo actualizamos si hay cambio para evitar loops o saltos de cursor
    if (input.value !== value) {
      input.value = value;
      // Importante: Notificar al FormControl del cambio
      this.form.get('curp')?.setValue(value, { emitEvent: false });
    }
  }
}
