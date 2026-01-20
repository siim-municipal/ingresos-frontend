import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  Validators,
  FormGroup,
  FormControl,
} from '@angular/forms';
import { Router } from '@angular/router';

// Material Modules
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatStepperModule } from '@angular/material/stepper';

// Shared / Core
import { FeedbackService } from '@gob-ui/shared/services';
import { AguaService } from '../../services/agua.service';
import { TipoToma, ContratoAguaRequest } from '../../models/contrato.models';
import { Predio, PredioSearch } from '@gob-ui/catastro';

// Definición estricta del formulario
interface ContratoForm {
  tipoToma: FormControl<TipoToma>;
  esServicioMedido: FormControl<boolean>;
  numeroSerieMedidor: FormControl<string | null>;
  lecturaInicial: FormControl<number>;
  observaciones: FormControl<string | null>;
}

@Component({
  selector: 'lib-contrato-agua-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatInputModule,
    MatSelectModule,
    MatCheckboxModule,
    MatCardModule,
    MatIconModule,
    MatStepperModule,
    PredioSearch,
  ],
  templateUrl: './contrato-agua-form.html',
  styleUrl: './contrato-agua-form.scss',
})
export class ContratoAguaForm {
  // Inyecciones
  private fb = inject(FormBuilder);
  private aguaService = inject(AguaService);
  private feedback = inject(FeedbackService);
  private router = inject(Router);

  // Constantes para el template
  readonly tiposToma = Object.values(TipoToma);

  // Estado Reactivo
  predioSeleccionado = signal<Predio | null>(null);
  isLoading = signal(false);

  // Formulario Tipado
  form: FormGroup<ContratoForm> = this.fb.group({
    tipoToma: new FormControl(TipoToma.DOMESTICA, {
      nonNullable: true,
      validators: [Validators.required],
    }),
    esServicioMedido: new FormControl(false, { nonNullable: true }),
    numeroSerieMedidor: new FormControl<string | null>(null), // Inicialmente opcional
    lecturaInicial: new FormControl(0, {
      nonNullable: true,
      validators: [Validators.min(0)],
    }),
    observaciones: new FormControl(''),
  });

  constructor() {
    // Usamos events de form control para reaccionar al cambio de "esMedido"
    this.form.controls.esServicioMedido.valueChanges.subscribe((isMedido) => {
      const medidorControl = this.form.controls.numeroSerieMedidor;

      if (isMedido) {
        medidorControl.setValidators([
          Validators.required,
          Validators.minLength(3),
        ]);
      } else {
        medidorControl.clearValidators();
        medidorControl.setValue(null); // Limpieza de datos
      }
      medidorControl.updateValueAndValidity();
    });
  }

  // --- ACTIONS ---

  onPredioSelected(predio: Predio): void {
    // 1. Bloqueamos UI para que el usuario sepa que estamos validando
    this.isLoading.set(true);

    // 2. Consultamos al backend
    this.aguaService.verificarExistenciaContrato(predio.id).subscribe({
      next: (existe) => {
        this.isLoading.set(false);

        if (existe) {
          // ESCENARIO A: YA TIENE CONTRATO
          this.feedback.warning(
            'Predio con Contrato',
            `El predio ${predio.claveCatastral} ya tiene un servicio de agua activo. No se puede crear uno nuevo.`,
          );
          // TODO: redirigir al detalle del contrato existente
          // this.router.navigate(['/agua/contratos/detalle', predio.id]);

          this.limpiarSeleccion();
        } else {
          // ESCENARIO B: ESTÁ LIBRE
          this.predioSeleccionado.set(predio);
          this.feedback.info(`Predio seleccionado: ${predio.claveCatastral}`);
        }
      },
      error: (err) => {
        this.isLoading.set(false);
        console.error(err);
        this.feedback.error(
          'Error de Validación',
          'No pudimos verificar el estado del predio. Intente de nuevo.',
        );
      },
    });
  }

  limpiarSeleccion(): void {
    this.predioSeleccionado.set(null);
    this.form.reset({
      tipoToma: TipoToma.DOMESTICA,
      esServicioMedido: false,
      lecturaInicial: 0,
    });
  }

  guardarContrato(): void {
    if (this.form.invalid || !this.predioSeleccionado()) {
      this.form.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    const formValue = this.form.getRawValue();

    const request: ContratoAguaRequest = {
      predioId: this.predioSeleccionado()!.id,
      tipoToma: formValue.tipoToma,
      esServicioMedido: formValue.esServicioMedido,
      numeroMedidor: formValue.numeroSerieMedidor || undefined,
      lecturaInicial: formValue.lecturaInicial,
      observaciones: formValue.observaciones || undefined,
    };

    this.aguaService.crearContrato(request).subscribe({
      next: () => {
        this.feedback.success(
          'Contrato Generado',
          `Se ha dado de alta el servicio para el predio ${this.predioSeleccionado()?.claveCatastral}`,
        );
        this.isLoading.set(false);
        this.router.navigate(['/agua/contratos']);
      },
      error: (err) => {
        this.isLoading.set(false);
        // Manejo específico del criterio de aceptación: "Un predio no puede tener dos contratos"
        if (err.status === 409) {
          this.feedback.error(
            'Operación Rechazada',
            'Este predio ya cuenta con un contrato de agua activo.',
          );
        } else {
          this.feedback.error(
            'Error',
            'No se pudo guardar el contrato. Intente nuevamente.',
          );
        }
      },
    });
  }
}
